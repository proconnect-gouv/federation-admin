import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { RnippService } from './rnipp.service';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { RnippSerializer } from './rnipp-serializer.service';
import { CitizenServiceBase } from '@fc/shared/citizen/citizen-base.service';
import { LoggerService } from '@fc/shared/logger/logger.service';
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

  const loggerMock = {
    info: jest.fn(),
    debug: jest.fn(),
  };

  const citizenMock = {
    getPivotIdentityHash: jest.fn(),
    findByHash: jest.fn(),
  };

  const personData = {
    gender: 'male',
    familyName: 'string',
    preferredUsername: 'string',
    givenName: 'string',
    birthdate: '1992-03-03',
    birthPlace: '95277',
    birthCountry: '99100',
  };

  const req = {
    user: {
      email: 'email@IsEmail.fr',
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RnippService,
        HttpService,
        ConfigService,
        RnippSerializer,
        LoggerService,
        CitizenServiceBase,
      ],
    })
      .overrideProvider(HttpService)
      .useValue(httpService)
      .overrideProvider(ConfigService)
      .useValue(configService)
      .overrideProvider(RnippSerializer)
      .useValue(rnippSerializerMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(CitizenServiceBase)
      .useValue(citizenMock)
      .compile();

    rnippService = module.get<RnippService>(RnippService);
    jest.resetAllMocks();

    citizenMock.getPivotIdentityHash.mockReturnValue(
      'fhsekfeshsfefeefeseshjehkfhefsk',
    );
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

      const personParsedData = {
        identity: {
          gender: 'male',
          familyName: 'string',
          preferredUsername: 'string',
          givenName: 'string',
          birthdate: '1992-03-03',
          birthPlace: 'string',
          birthCountry: 'string',
          supportId: '1234567891234567',
        },
        rnippCode: '2',
      };

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(result));
      jest
        .spyOn(rnippSerializerMock, 'serializeXmlFromRnipp')
        .mockImplementation(() => Promise.resolve(personParsedData));
      jest.spyOn(loggerMock, 'info');

      const person = await rnippService.requestIdentityRectification(
        personParsedData.identity,
      );

      expect(person).toEqual({
        rectifiedIdentity: personParsedData.identity,
        rnippCode: personParsedData.rnippCode,
        rawResponse: result.data,
        statusCode: result.status,
        identityHash: {
          idp: 'fhsekfeshsfefeefeseshjehkfhefsk',
          rnipp: 'fhsekfeshsfefeefeseshjehkfhefsk',
        },
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

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(result));
      jest.spyOn(loggerMock, 'info');

      try {
        await rnippService.requestIdentityRectification(personData);
      } catch (error) {
        expect(error).toEqual({
          rawResponse: result.data,
          statusCode: result.status,
          message: result.statusText,
          identityHash: {
            idp: 'fhsekfeshsfefeefeseshjehkfhefsk',
          },
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

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(result));
      jest.spyOn(loggerMock, 'info');

      try {
        await rnippService.requestIdentityRectification(personData);
      } catch (error) {
        expect(error).toEqual({
          rawResponse: 'No Data from rnipp',
          statusCode: result.status,
          message: result.statusText,
          identityHash: {
            idp: 'fhsekfeshsfefeefeseshjehkfhefsk',
          },
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

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(result));
      jest.spyOn(loggerMock, 'info');

      try {
        await rnippService.requestIdentityRectification(personData);
      } catch (error) {
        expect(error).toEqual({
          rawResponse: 'No Data from rnipp',
          statusCode: result.status,
          message: result.statusText,
          identityHash: {
            idp: 'fhsekfeshsfefeefeseshjehkfhefsk',
          },
        });
      }
    });
  });
});
