import { createReadStream } from 'fs';
import * as csvParser from 'csv-parser';
import { cloneDeep } from 'lodash';
import { Injectable, HttpService } from '@nestjs/common';
import { InjectConfig } from 'nestjs-config';
import { IIdentity } from '@fc/shared/citizen/interfaces/identity.interface';
import { IPivotIdentity } from '@fc/shared/citizen/interfaces/pivot-identity.interface';
import { RnippSerializer } from './rnipp-serializer.service';
import * as queryString from 'query-string';
import { IResponseFromRnipp } from './interface/response-from-rnipp.interface';
import { ParsedData } from './interface/parsed-data.interface';
import { CitizenServiceBase } from '@fc/shared/citizen/citizen-base.service';
import { LoggerService } from '@fc/shared/logger/logger.service';
import { PersonGenericDTO } from './dto/person-generic.dto';
import { ValidationError, validateSync } from 'class-validator';
import { RectificationRequestDTO } from './dto';
import { InseeCityDBInterface, InseeCountryDBInterface } from './interface';

@Injectable()
export class RnippService {
  cityCSVparsed: InseeCityDBInterface[];
  countryCSVparsed: InseeCountryDBInterface[];

  public constructor(
    @InjectConfig() private readonly config,
    private readonly http: HttpService,
    private readonly serializer: RnippSerializer,
    private readonly citizen: CitizenServiceBase,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    const { cityCSVPath } = this.config.get('insee-city-database');
    const { countryCSVPath } = this.config.get('insee-country-database');

    try {
      this.cityCSVparsed = await this.csvParse(cityCSVPath);
      this.cityCSVparsed = cloneDeep(this.cityCSVparsed);

      this.countryCSVparsed = await this.csvParse(countryCSVPath);
      this.countryCSVparsed = cloneDeep(this.countryCSVparsed);
    } catch (err) {
      this.logger.error('Error reading the CSV file:', err);
      return null;
    }
  }

  public async requestIdentityRectification(
    identityData: IIdentity,
  ): Promise<IResponseFromRnipp | any> {
    const idpIdentityHash = this.citizen.getPivotIdentityHash(
      identityData as IPivotIdentity,
    );

    this.logger.debug(`Requested identity hash: ${idpIdentityHash}`);

    const rnippUrl: string = this.constructRequestUrl(
      identityData as IPivotIdentity,
    );

    this.logger.debug(`Calling RNIPP with: ${rnippUrl}...`);

    const {
      status: statusCode,
      data: rawResponse,
      statusText: message,
    } = await this.http.get(rnippUrl).toPromise();

    this.logger.debug(`RNIPP Response status: ${statusCode}`);

    const templateError = {
      identityHash: {
        idp: idpIdentityHash,
      },
      rawResponse,
      statusCode,
      message,
    };

    if (statusCode !== 200 || !rawResponse) {
      throw {
        ...templateError,
        rawResponse: rawResponse || 'No Data from rnipp',
      };
    }

    this.logger.debug('Calling serializer to get understandable json');

    let parsedIdentity: ParsedData;
    try {
      parsedIdentity = await this.serializer.serializeXmlFromRnipp(rawResponse);
    } catch (error) {
      throw {
        ...templateError,
        rawResponse: undefined, // hide RNIPP response data
        message: "Une erreur s'est produite lors de l'appel au RNIPP.",
      };
    }

    const { identity, rnippCode, dead } = parsedIdentity;
    if (!identity) {
      return {
        rectifiedIdentity: identityData,
        rnippDead: false,
        rnippCode,
        rawResponse,
        statusCode,
        identityHash: {
          idp: idpIdentityHash,
        },
      };
    }

    this.logger.debug('Check the format of the returned Identity');
    const errors = this.validateIdentityFormat(identity);
    if (errors.length) {
      const failures = errors.map(({ constraints }) =>
        Object.values(constraints).join(','),
      );
      throw { errors: failures };
    }

    const rnippIdentityHash = this.citizen.getPivotIdentityHash(
      identity as IPivotIdentity,
    );

    return {
      rectifiedIdentity: identity,
      rnippCode,
      rnippDead: dead === true,
      rawResponse,
      statusCode,
      identityHash: {
        idp: idpIdentityHash,
        rnipp: rnippIdentityHash,
      },
    };
  }

  private validateIdentityFormat(
    identity: PersonGenericDTO,
  ): ValidationError[] {
    return validateSync(identity);
  }

  private constructRequestUrl(pivotIdentity: IPivotIdentity): string {
    const protocol = this.config.get('rnipp.protocol');
    const hostname = this.config.get('rnipp.hostname');
    const baseUrl = this.config.get('rnipp.baseUrl');

    const params = {
      nom: pivotIdentity.familyName,
      prenoms: pivotIdentity.givenName,
      dateNaissance: pivotIdentity.birthdate.replace(/\-/g, ''),
      sexe: pivotIdentity.gender.charAt(0).toUpperCase(),
      codeLieuNaissance: pivotIdentity.birthPlace || pivotIdentity.birthCountry,
    };
    const query = queryString.stringify(params);

    this.logger.debug(`Query for call rnipp API : ${query}`);
    this.logger.debug(
      `Url for call rnipp API : ${protocol}://${hostname}${baseUrl}&${query}`,
    );

    return `${protocol}://${hostname}${baseUrl}&${query}`;
  }

  async buildIdentitiestoRectify(
    rectificationRequest: RectificationRequestDTO,
  ): Promise<IIdentity[]> {
    const { birthLocation, isFrench } = rectificationRequest;

    const cogByLocationNameList = await this.findCogByLocationName(
      birthLocation,
      isFrench,
    );

    const identitiesToRectify: IIdentity[] = [];
    cogByLocationNameList.forEach(({ cog }) => {
      const rectificationRequestCopy = cloneDeep(rectificationRequest);
      rectificationRequestCopy.birthLocation = cog;

      identitiesToRectify.push(
        rectificationRequestCopy.toIdentity() as IIdentity,
      );
    });

    return identitiesToRectify;
  }

  private async findCogByLocationName(
    birthLocation: string,
    isFrench: boolean,
  ): Promise<InseeCityDBInterface[] | InseeCountryDBInterface[]> {
    const {
      limit: limitCityDisplaying,
      fieldsToSearch: fieldsToSearchInCity,
    } = this.config.get('insee-city-database');
    const {
      limit: limitCountryDisplaying,
      fieldsToSearch: fieldsToSearchInCountry,
    } = this.config.get('insee-country-database');

    let data = [];
    const searchType = isFrench ? 'commune' : 'pays';
    const limit = isFrench ? limitCityDisplaying : limitCountryDisplaying;

    if (isFrench) {
      data = await this.findAllCog(
        this.cityCSVparsed,
        birthLocation,
        fieldsToSearchInCity,
      );
    } else {
      data = await this.findAllCog(
        this.countryCSVparsed,
        birthLocation,
        fieldsToSearchInCountry,
      );
    }

    this.logger.log({
      searchType,
      birthLocation,
      totalFound: data.length,
    });

    return data.slice(0, limit);
  }

  private async csvParse(csvFilePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results = [];

      // Read the CSV file and parse it
      createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', row => {
          results.push(row);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', err => {
          reject(err);
        });
    });
  }

  private async findAllCog(
    data: any[],
    searchTerm: string,
    fieldsToSearch: string[],
  ): Promise<InseeCityDBInterface[] | InseeCountryDBInterface[]> {
    const matchingObjects = data.filter(item => {
      return fieldsToSearch.some(
        key => item[key] && item[key].toString().includes(searchTerm),
      );
    });

    return matchingObjects;
  }
}
