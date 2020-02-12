import { Injectable, HttpService } from '@nestjs/common';
import { InjectConfig } from 'nestjs-config';
import { validate } from 'class-validator';
import { IIdentity } from '@fc/shared/citizen/interfaces/identity.interface';
import { IPivotIdentity } from '@fc/shared/citizen/interfaces/pivot-identity.interface';
import { RnippSerializer } from './rnipp-serializer.service';
import * as queryString from 'query-string';
import { IResponseFromRnipp } from './interface/response-from-rnipp.interface';
import { ParsedData } from './interface/parsed-data.interface';
import { CitizenServiceBase } from '@fc/shared/citizen/citizen-base.service';
import { PersonGenericDTO } from './dto/person-generic.dto';
import { LoggerService } from '@fc/shared/logger/logger.service';

@Injectable()
export class RnippService {
  public constructor(
    @InjectConfig() private readonly config,
    private readonly http: HttpService,
    private readonly serializer: RnippSerializer,
    private readonly citizen: CitizenServiceBase,
    private readonly logger: LoggerService,
  ) {}

  public async requestIdentityRectification(
    identityData: IIdentity,
  ): Promise<IResponseFromRnipp | any> {
    const idpIdentityHash = await this.citizen.getPivotIdentityHash(
      identityData as IPivotIdentity,
    );

    this.logger.debug(`Requested identity hash: ${idpIdentityHash}`);

    const rnippUrl: string = this.constructRequestUrl(
      identityData as IPivotIdentity,
    );

    this.logger.debug(`Calling RNIPP with: ${rnippUrl}...`);

    const axiosResponse = await this.http.get(`${rnippUrl}`).toPromise();

    this.logger.debug(`RNIPP Response status: ${axiosResponse.status}`);

    if (axiosResponse.status !== 200 || !axiosResponse.data) {
      throw {
        rawResponse: axiosResponse.data || 'No Data from rnipp',
        statusCode: axiosResponse.status,
        message: axiosResponse.statusText,
        identityHash: {
          idp: idpIdentityHash,
        },
      };
    }

    this.logger.debug('Calling serializer to get understandable json');

    const {
      identity,
      rnippCode,
      dead,
    }: ParsedData = await this.serializer.serializeXmlFromRnipp(
      axiosResponse.data,
    );

    if (!identity) {
      throw {
        rawResponse: axiosResponse.data,
        statusCode: axiosResponse.status,
        message: "Une erreur s'est produite lors de l'appel au RNIPP.",
        rnippCode,
        identityHash: {
          idp: idpIdentityHash,
        },
      };
    }

    const errors = await this.validateIdentityFormat(identity);

    if (errors.length > 0) {
      throw errors;
    }

    const rnippIdentityHash = await this.citizen.getPivotIdentityHash(
      identity as IPivotIdentity,
    );

    return {
      rectifiedIdentity: identity || {},
      rnippCode,
      rnippDead: dead === true,
      rawResponse: axiosResponse.data,
      statusCode: axiosResponse.status,
      identityHash: {
        idp: idpIdentityHash,
        rnipp: rnippIdentityHash,
      },
    };
  }

  private async validateIdentityFormat(identity: PersonGenericDTO) {
    return validate(identity);
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
}
