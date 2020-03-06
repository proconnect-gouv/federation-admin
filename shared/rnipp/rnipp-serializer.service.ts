import { Injectable, Inject } from '@nestjs/common';
import * as _ from 'lodash';
import { LoggerService } from '@fc/shared/logger/logger.service';

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
  DEAD,
  RNIPP_IDENTITY_NOT_RECTIFIED,
  RNIPP_IDENTITY_RECTIFIED,
  FRANCE_COG,
} from './rnipp-constants';

import { ParsedData } from './interface/parsed-data.interface';
import { IIdentity } from '../citizen/interfaces/identity.interface';

@Injectable()
export class RnippSerializer {
  public constructor(
    @Inject('Xml2js') private readonly xml2js,
    private readonly logger: LoggerService,
  ) {}

  public async serializeXmlFromRnipp(xmlData: string): Promise<ParsedData> {
    this.logger.debug(`Serializer XML ${xmlData}`);
    const options = {
      tagNameProcessors: [this.xml2js.processors.stripPrefix],
    };
    try {
      const json = await this.xml2jsToPromise(xmlData, options);
      return this.parseToJSON(json);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private parseToJSON(parsedXml: JSON): ParsedData {
    const rnippCode: string = this.getJsonAttribute(parsedXml, RNIPP_CODE);

    if (
      rnippCode !== RNIPP_IDENTITY_NOT_RECTIFIED &&
      rnippCode !== RNIPP_IDENTITY_RECTIFIED
    ) {
      return { rnippCode };
    }

    const dead: boolean = this.getDeadStateAttribute(
      parsedXml,
      `${IDENTIFICATION}.${DEAD}`,
    );

    const identity: IIdentity = {
      gender: this.getGenderFromParsedXml(
        parsedXml,
        `${IDENTIFICATION}.${GENDER}`,
      ),
      familyName: this.getJsonAttribute(
        parsedXml,
        `${IDENTIFICATION}.${FAMILY_NAME}`,
      ),
      givenName: this.getGivenNamesAttribute(
        parsedXml,
        `${IDENTIFICATION}.${GIVEN_NAME}`,
      ),
      preferredUsername: this.getJsonAttribute(
        parsedXml,
        `${IDENTIFICATION}.${PREFERED_NAME}`,
      ),
      birthdate: this.getJsonAttribute(
        parsedXml,
        `${IDENTIFICATION}.${BIRTH_DATE}`,
      ),
      birthPlace: this.getBirthplaceAttribute(
        parsedXml,
        `${IDENTIFICATION}.${BIRTH_PLACE}`,
        `${IDENTIFICATION}.${BIRTH_COUNTRY}`,
      ),
      birthCountry: this.getBirthcountryAttribute(
        parsedXml,
        `${IDENTIFICATION}.${BIRTH_PLACE}`,
        `${IDENTIFICATION}.${BIRTH_COUNTRY}`,
      ),
    };

    return {
      identity,
      dead,
      rnippCode,
    };
  }

  private xml2jsToPromise(input, options): Promise<JSON> {
    return new Promise((resolve, reject) => {
      this.xml2js.parseString(input, options, (error, result) => {
        if (error) {
          this.logger.error(`Error in xml2js module => (${error})`);
          reject(new Error(`Error in xml2js module`));
        } else {
          resolve(result);
        }
      });
    });
  }

  private getJsonAttribute(
    parsedXml: JSON,
    path: string,
    defaultValue: any = '',
  ): any {
    return _.get(parsedXml, path, defaultValue);
  }

  private getGenderFromParsedXml(parsedXml: JSON, path: string): string {
    const rnippGender: string = this.getJsonAttribute(parsedXml, path);

    switch (rnippGender) {
      case 'F':
        return 'female';
      case 'M':
        return 'male';
      default:
        return '';
    }
  }

  private getGivenNamesAttribute(parsedXml: JSON, path: string): string {
    const givenNames: string[] = this.getJsonAttribute(parsedXml, path, []);

    return givenNames.join(' ');
  }

  private getDeadStateAttribute(parsedXml: JSON, path: string): boolean {
    return !!this.getJsonAttribute(parsedXml, path, false);
  }

  private getBirthplaceAttribute(
    parsedXml: JSON,
    birthplacePath: string,
    birthcountryPath: string,
  ): string {
    const birthcountry = this.getJsonAttribute(parsedXml, birthcountryPath);

    const birthplace = this.getJsonAttribute(parsedXml, birthplacePath);

    if (!birthplace && !birthcountry) {
      return 'invalid';
    }

    return birthplace;
  }

  private getBirthcountryAttribute(
    parsedXml: JSON,
    birthplacePath: string,
    birthcountryPath: string,
  ): string {
    const birthplace = this.getJsonAttribute(parsedXml, birthplacePath);

    const birthcountry = this.getJsonAttribute(parsedXml, birthcountryPath);

    if (!birthplace && !birthcountry) {
      return 'invalid';
    }

    return birthcountry || FRANCE_COG;
  }
}
