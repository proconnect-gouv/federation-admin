import { Injectable, HttpService, Logger } from '@nestjs/common';
import { InjectConfig } from 'nestjs-config';
import { Person } from './interface/person.interface';
import { RnippSerializer } from './rnippSerializer.service';
import * as queryString from 'query-string';
import { PersonFromRnipp } from './interface/personFromRnipp.interface';
import { ParsedData } from './interface/parsed-data.interface';

@Injectable()
export class RnippService {
  public constructor(
    @InjectConfig() private readonly config,
    private readonly http: HttpService,
    private readonly serializer: RnippSerializer,
  ) {}

  public async getJsonFromRnippApi(
    personData: Person,
  ): Promise<PersonFromRnipp | any> {
    Logger.debug(`Will get xml`);

    const rnippUrl: string = this.createRnippUrl(personData);

    const response = this.http.get(`${rnippUrl}`);

    return response.toPromise().then(async axiosResponse => {
      if (axiosResponse.status === 200 && axiosResponse.data) {
        const xmlFromRnipp: string = axiosResponse.data;
        Logger.debug(`Xml => ${xmlFromRnipp}`);
        const user: ParsedData = await this.serializer.serializeXmlFromRnipp(
          xmlFromRnipp,
        );
        return {
          personFoundByRnipp: user.identity,
          rnippCode: user.rnippCode,
          rawResponse: xmlFromRnipp,
          statusCode: axiosResponse.status,
        };
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
      codeLieuNaissance: personData.birthPlace
        ? personData.birthPlace
        : personData.birthCountry,
    };
    const query = queryString.stringify(params);

    Logger.debug(`Query for call rnipp API : ${query}`);
    Logger.debug(
      `Url for call rnipp API : ${protocol}://${hostname}${baseUrl}&${query}`,
    );

    return `${protocol}://${hostname}${baseUrl}&${query}`;
  }
}
