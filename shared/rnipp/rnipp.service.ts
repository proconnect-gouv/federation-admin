import { Injectable, HttpService, Logger } from '@nestjs/common';
import { InjectConfig } from 'nestjs-config';
import { Person } from './interface/person.interface';
import { RnippSerializer } from './rnippSerializer.service';
import * as queryString from 'query-string';
import { PersonFromRnipp } from './interface/personFromRnipp.interface';
import { ParsedData } from './interface/parsed-data.interface';
import { TraceService } from '@fc/shared/logger/trace.service';
import { LogActions } from '@fc/shared/logger/enum/log-actions.enum';
import { CitizenServiceBase } from '@fc/shared/citizen/citizen-base.service';
import { CitizenIdentityDTO } from '@fc/shared/citizen/dto/citizen-identity.dto';

@Injectable()
export class RnippService {
  public constructor(
    @InjectConfig() private readonly config,
    private readonly http: HttpService,
    private readonly serializer: RnippSerializer,
    private readonly logger: TraceService,
    private readonly citizen: CitizenServiceBase,
  ) {}

  public async getJsonFromRnippApi(
    req: any,
    personData: Person,
  ): Promise<PersonFromRnipp | any> {
    const identityHash = await this.getRnippRequestedUserHash(personData);
    this.logger.supportRnippCall({
      action: LogActions.SUPPORT_RNIPP_CALL,
      user: req.user.username,
      motif: `ticket support : ${personData.supportId}`,
      identityHash,
    });
    Logger.debug(`Will get xml`);

    const rnippUrl: string = this.createRnippUrl(personData);

    const response = this.http.get(`${rnippUrl}`);

    return response.toPromise().then(async axiosResponse => {
      if (axiosResponse.status === 200 && axiosResponse.data) {
        const xmlFromRnipp: string = axiosResponse.data;
        Logger.debug(`Xml => ${xmlFromRnipp}`);
        const user: ParsedData = await this.serializer.serializeXmlFromRnipp(
          xmlFromRnipp,
          personData,
        );
        if (user.rnippCode === '2' || user.rnippCode === '3') {
          return {
            personFoundByRnipp: user.identity || {},
            rnippCode: user.rnippCode,
            rawResponse: xmlFromRnipp,
            statusCode: axiosResponse.status,
          };
        } else {
          throw {
            rawResponse: xmlFromRnipp,
            statusCode: axiosResponse.status,
            message: "Une erreur s'est produite lors de l'appel au RNIPP.",
            rnippCode: user.rnippCode,
          };
        }
      }

      Logger.warn(`Response status is not ok. Xml => null`);

      throw {
        rawResponse: axiosResponse.data || 'No Data from rnipp',
        statusCode: axiosResponse.status,
        message: axiosResponse.statusText,
      };
    });
  }

  private createRnippUrl(personData: Person): string {
    const protocol = this.config.get('rnipp.protocol');
    const hostname = this.config.get('rnipp.hostname');
    const baseUrl = this.config.get('rnipp.baseUrl');

    const params = {
      nom: personData.familyName,
      prenoms: personData.givenName,
      dateNaissance: personData.birthdate.replace(/\-/g, ''),
      sexe: personData.gender.charAt(0).toUpperCase(),
      codeLieuNaissance: personData.birthPlace,
    };
    const query = queryString.stringify(params);

    Logger.debug(`Query for call rnipp API : ${query}`);
    Logger.debug(
      `Url for call rnipp API : ${protocol}://${hostname}${baseUrl}&${query}`,
    );

    return `${protocol}://${hostname}${baseUrl}&${query}`;
  }

  private getRnippRequestedUserHash(personData: Person): string {
    const userToFind = RnippService.convertPersonToCitizen(personData);
    return this.citizen.getCitizenHash(userToFind);
  }

  private static convertPersonToCitizen(
    personData: Person,
  ): CitizenIdentityDTO {
    if (!personData) {
      return null;
    }
    const {
      gender = '',
      familyName = '',
      givenName = '',
      preferredUsername = '',
      birthdate,
      birthCountry,
      birthPlace,
    } = personData;

    let bd = new Date(birthdate);
    bd = bd instanceof Date && !isNaN(bd as any) ? bd : ('' as any);
    return {
      gender,
      familyName,
      givenName,
      preferredUsername,
      birthdate: bd,
      birthCountry: parseInt(birthCountry, 10) || 0,
      birthPlace: parseInt(birthPlace, 10) || 0,
    } as any;
  }
}
