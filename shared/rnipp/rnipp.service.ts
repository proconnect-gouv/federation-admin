import { Injectable, HttpService, Logger } from '@nestjs/common';
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

@Injectable()
export class RnippService {
  public constructor(
    @InjectConfig() private readonly config,
    private readonly http: HttpService,
    private readonly serializer: RnippSerializer,
    private readonly citizen: CitizenServiceBase,
  ) {}

  public async requestIdentityRectification(
    identity: IIdentity,
  ): Promise<IResponseFromRnipp | any> {
    const idpIdentityHash = await this.citizen.getPivotIdentityHash(
      identity as IPivotIdentity,
    );

    Logger.debug(`Requested identity hash: ${idpIdentityHash}`);

    const rnippUrl: string = this.constructRequestUrl(
      identity as IPivotIdentity,
    );

    Logger.debug(`Calling RNIPP with: ${rnippUrl}...`);

    const axiosResponse = await this.http.get(`${rnippUrl}`).toPromise();

    Logger.debug(`RNIPP Response status: ${axiosResponse.status}`);

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

    Logger.debug('Calling serializer to get understandable json');

    const user: ParsedData = await this.serializer.serializeXmlFromRnipp(
      axiosResponse.data,
    );

    if (!user.identity) {
      throw {
        rawResponse: axiosResponse.data,
        statusCode: axiosResponse.status,
        message: "Une erreur s'est produite lors de l'appel au RNIPP.",
        rnippCode: user.rnippCode,
        identityHash: {
          idp: idpIdentityHash,
        },
      };
    }

    const errors = await this.validateIdentityFormat(user.identity);

    if (errors.length > 0) {
      throw errors;
    }

    const rnippIdentityHash = await this.citizen.getPivotIdentityHash(
      user.identity as IPivotIdentity,
    );

    return {
      rectifiedIdentity: user.identity || {},
      rnippCode: user.rnippCode,
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

    Logger.debug(`Query for call rnipp API : ${query}`);
    Logger.debug(
      `Url for call rnipp API : ${protocol}://${hostname}${baseUrl}&${query}`,
    );

    return `${protocol}://${hostname}${baseUrl}&${query}`;
  }
}
