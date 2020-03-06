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
      throw {
        ...templateError,
        message: "Une erreur s'est produite lors de l'appel au RNIPP.",
        rnippCode,
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

    const rnippIdentityHash = await this.citizen.getPivotIdentityHash(
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
}
