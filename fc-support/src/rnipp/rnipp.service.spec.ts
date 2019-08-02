import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { RnippService } from './rnipp.service';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { RnippSerializer } from './rnippSerializer.service';

describe('RnippService (e2e)', () => {
  let rnippService: RnippService;

  const httpService = {
    get: jest.fn(),
  };

  const configService = {
    get: jest.fn(),
  };

  const rnippSerializerMock = {
    serializeXmlFromRnipp: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RnippService, HttpService, ConfigService, RnippSerializer],
    })
      .overrideProvider(HttpService)
      .useValue(httpService)
      .overrideProvider(ConfigService)
      .useValue(configService)
      .overrideProvider(RnippSerializer)
      .useValue(rnippSerializerMock)
      .compile();

    rnippService = module.get<RnippService>(RnippService);
    jest.resetAllMocks();
  });

  describe(`getXmlFormRnippApi`, () => {
    it(`should return userInfo when called successfully`, async () => {
      const result: AxiosResponse = {
        data: 'Components',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      const personData = {
        identity: {
          gender: 'male',
          familyName: 'string',
          preferredUsername: 'string',
          givenName: 'string',
          birthdate: '1992-03-03',
          birthPlace: 'string',
          birthCountry: 'string',
        },
        rnippCode: 2,
      };

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(result));
      jest
        .spyOn(rnippSerializerMock, 'serializeXmlFromRnipp')
        .mockImplementation(() => Promise.resolve(personData));

      const person = await rnippService.getJsonFromRnippApi(
        personData.identity,
      );

      expect(person).toEqual({
        personFoundByRnipp: personData.identity,
        rnippCode: personData.rnippCode,
        rawResponse: result.data,
        statusCode: result.status,
      });
    });

    it(`should reject an error when called with not a 200 from rnipp`, async () => {
      const result: AxiosResponse = {
        data: 'Components',
        status: 500,
        statusText: 'Not Ok',
        headers: {},
        config: {},
      };

      const personData = {
        gender: 'male',
        familyName: 'string',
        preferredUsername: 'string',
        givenName: 'string',
        birthdate: '1992-03-03',
        birthPlace: 'string',
        birthCountry: 'string',
      };

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(result));

      try {
        await rnippService.getJsonFromRnippApi(personData);
      } catch (error) {
        expect(error).toEqual({
          rawResponse: result.data,
          statusCode: result.status,
          message: result.statusText,
        });
      }
    });

    it(`should reject an error when rnipp has no data`, async () => {
      const result = {
        status: 500,
        statusText: 'Not Ok',
        headers: {},
        config: {},
      };

      const personData = {
        gender: 'male',
        familyName: 'string',
        preferredUsername: 'string',
        givenName: 'string',
        birthdate: '1992-03-03',
        birthPlace: 'string',
        birthCountry: 'string',
      };

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(result));

      try {
        await rnippService.getJsonFromRnippApi(personData);
      } catch (error) {
        expect(error).toEqual({
          rawResponse: 'No Data from rnipp',
          statusCode: result.status,
          message: result.statusText,
        });
      }
    });

    it(`should reject an error when rnipp has no data`, async () => {
      const result = {
        status: 500,
        statusText: 'Not Ok',
        headers: {},
        config: {},
      };

      const personData = {
        gender: 'male',
        familyName: 'string',
        preferredUsername: 'string',
        givenName: 'string',
        birthdate: '1992-03-03',
        birthPlace: 'string',
        birthCountry: 'string',
      };

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(result));

      try {
        await rnippService.getJsonFromRnippApi(personData);
      } catch (error) {
        expect(error).toEqual({
          rawResponse: 'No Data from rnipp',
          statusCode: result.status,
          message: result.statusText,
        });
      }
    });
  });
});
