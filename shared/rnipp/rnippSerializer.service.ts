import { Logger, Injectable, Inject } from '@nestjs/common';
import { plainToClassFromExist } from 'class-transformer';
import * as _ from 'lodash';

import {
  IDENTIFICATION,
  GENDER,
  FAMILY_NAME,
  GIVEN_NAME,
  PREFERED_NAME,
  BIRTH_DATE,
  RNIPP_CODE,
  BIRTH_PLACE,
  BIRTH_COUNTRY,
} from './rnipp-xml-selectors-constants';

import { ParsedData } from './interface/parsed-data.interface';
import { validate } from 'class-validator';
import { PersonRequestedDTO } from './dto/person-requested-input.dto';
import { Person } from './interface/person.interface';

@Injectable()
export class RnippSerializer {
  public constructor(@Inject('Xml2js') private readonly xml2js) {}

  public async serializeXmlFromRnipp(
    xmlData: string,
    personRequest: Person,
  ): Promise<ParsedData> {
    Logger.debug(`Serializer xml ${xmlData}`);
    const stripNS = this.xml2js.processors.stripPrefix;

    try {
      const json = await this.xml2jsToPromise(xmlData, {
        tagNameProcessors: [stripNS],
      });

      const response = await this.handleResponse(json, personRequest);
      return response;
    } catch (reason) {
      const constraints = reason.map(validationErrors => {
        // tslint:disable-next-line: forin
        for (const key in validationErrors.constraints) {
          return validationErrors.constraints[key];
        }
      });
      throw { errors: constraints };
    }
  }

  private async handleResponse(
    json,
    personRequest: Person,
  ): Promise<ParsedData> {
    const formatedData: ParsedData = this.formatJson(json, personRequest);
    if (formatedData.rnippCode === '2' || formatedData.rnippCode === '3') {
      const rnippDto = new PersonRequestedDTO();
      const validateFormatedData = plainToClassFromExist(
        rnippDto,
        formatedData.identity,
      );
      const errors = await validate(validateFormatedData);
      // errors is an array of validation errors
      if (errors.length > 0) {
        throw errors;
      } else {
        return formatedData;
      }
    } else {
      return formatedData;
    }
  }

  private xml2jsToPromise(input, options): Promise<any> {
    return new Promise((resolve, reject) => {
      this.xml2js.parseString(input, options, (error, result) => {
        if (error) {
          Logger.error(`Error in xml2js module => (${error})`);
          reject(new Error(`Error in xml2js module`));
        } else {
          resolve(result);
        }
      });
    });
  }

  private formatJson(json: any, personRequest: Person): ParsedData {
    const rnippCodeFromXML: string = _.get(
      json,
      `${RNIPP_CODE}`,
      'Pas de rnipp code',
    );

    // check the error code return by RNIPP before retrieve user info
    if (rnippCodeFromXML === '2' || rnippCodeFromXML === '3') {
      let birthCountry: string;
      let birthPlace: string;
      let translationGenderFormRnipp = _.get(
        json,
        `${IDENTIFICATION}.${GENDER}`,
        'Pas de genre renseigné',
      );
      if (translationGenderFormRnipp === 'M') {
        translationGenderFormRnipp = 'male';
      } else {
        translationGenderFormRnipp = 'female';
      }

      if (personRequest.birthCountry === '99100') {
        birthCountry = personRequest.birthCountry;
        birthPlace = _.get(
          json,
          `${IDENTIFICATION}.${BIRTH_PLACE}`,
          'Pas de lieu de naissance',
        );
      } else {
        birthCountry = _.get(
          json,
          `${IDENTIFICATION}.${BIRTH_COUNTRY}`,
          '99999',
        );
        birthPlace = '00000';
      }

      return {
        identity: {
          gender: translationGenderFormRnipp,
          familyName: _.get(
            json,
            `${IDENTIFICATION}.${FAMILY_NAME}`,
            'Pas de nom de famille',
          ),
          givenName: _.join(
            _.get(json, `${IDENTIFICATION}.${GIVEN_NAME}`, 'Pas de prénom'),
            ' ',
          ),
          preferredUsername: _.get(
            json,
            `${IDENTIFICATION}.${PREFERED_NAME}`,
            null,
          ),
          birthdate: _.get(
            json,
            `${IDENTIFICATION}.${BIRTH_DATE}`,
            'Pas de date de naissance',
          ),
          birthCountry,
          birthPlace,
        },
        rnippCode: rnippCodeFromXML,
      };
    } else {
      return {
        rnippCode: rnippCodeFromXML,
      };
    }
  }
}
