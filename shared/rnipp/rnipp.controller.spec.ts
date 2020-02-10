import { Test, TestingModule } from '@nestjs/testing';
import { RnippController } from './rnipp.controller';
import { RnippService } from './rnipp.service';
import { formattedXml, rawXml } from '../fixtures/xmlMockedString';
import { RectificationRequestDTO } from './dto/rectification-request.dto';
import { PersonFoundDTO } from './dto/person-found-output.dto';
import { IResponseFromRnipp } from './interface/response-from-rnipp.interface';
import { ErrorControllerInterface } from './interface/error-controller.interface';
import { LoggerService } from '@fc/shared/logger/logger.service';

describe('RnippController', () => {
  let rnippController: RnippController;

  const rnippService = {
    requestIdentityRectification: jest.fn(),
  };

  const identity = {
    gender: 'male',
    familyName: 'Dupont',
    preferredUsername: 'Henri',
    givenName: 'Pierr',
    birthdate: '1992-03-03',
    birthPlace: '75107',
    birthCountry: '99100',
  };

  const rectificationRequest: RectificationRequestDTO = {
    supportId: '1234567891234567',
    gender: 'male',
    familyName: 'Dupont',
    preferredUsername: 'Henri',
    givenName: 'Pierr',
    birthdate: '1992-03-03',
    isFrench: true,
    cog: '75107',
    toIdentity: () => identity,
  };

  const req = {
    user: {
      username: 'kenjin',
    },
    csrfToken: function csrfToken() {
      return 'mygreatcsrftoken';
    },
  };

  const loggerMock = {
    businessEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RnippController],
      providers: [RnippService, LoggerService],
    })
      .overrideProvider(RnippService)
      .useValue(rnippService)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    rnippController = module.get<RnippController>(RnippController);
    jest.resetAllMocks();
  });

  describe('researchRnipp', () => {
    it('should return an object of person', async () => {
      const mockedRnippService: IResponseFromRnipp = {
        rectifiedIdentity: {
          gender: 'male',
          familyName: 'Dupont',
          preferredUsername: 'Henri',
          givenName: 'Pierr',
          birthdate: '1992-03-03',
          birthPlace: '75107',
          birthCountry: '99100',
        },
        rawResponse: formattedXml.xmlString,
        rnippCode: 2,
        statusCode: 200,
      };

      const expectedResult: PersonFoundDTO = {
        person: {
          requestedIdentity: {
            gender: 'male',
            familyName: 'Dupont',
            preferredUsername: 'Henri',
            givenName: 'Pierr',
            birthdate: '1992-03-03',
            birthPlace: '75107',
            birthCountry: '99100',
          },
          rectifiedIdentity: {
            gender: 'male',
            familyName: 'Dupont',
            preferredUsername: 'Henri',
            givenName: 'Pierr',
            birthdate: '1992-03-03',
            birthPlace: '75107',
            birthCountry: '99100',
          },
        },
        rnippResponse: {
          code: 2,
          raw: formattedXml.xmlString,
        },
        supportId: '1234567891234567',
        csrfToken: 'mygreatcsrftoken',
      };

      rnippService.requestIdentityRectification.mockImplementationOnce(() => {
        return mockedRnippService;
      });

      const result = await rnippController.researchRnipp(
        rectificationRequest,
        req,
      );

      expect(result).toEqual(expectedResult);
    });

    it('should return information with formatted XML', async () => {
      const mockedRnippService: IResponseFromRnipp = {
        rectifiedIdentity: {
          gender: 'male',
          familyName: 'Dupont',
          preferredUsername: 'Henri',
          givenName: 'Pierr',
          birthdate: '1992-03-03',
          birthPlace: '75107',
          birthCountry: '99100',
        },
        rawResponse: rawXml.xmlString,
        rnippCode: 2,
        statusCode: 200,
      };

      const expectedResult: PersonFoundDTO = {
        person: {
          requestedIdentity: {
            gender: 'male',
            familyName: 'Dupont',
            preferredUsername: 'Henri',
            givenName: 'Pierr',
            birthdate: '1992-03-03',
            birthPlace: '75107',
            birthCountry: '99100',
          },
          rectifiedIdentity: {
            gender: 'male',
            familyName: 'Dupont',
            preferredUsername: 'Henri',
            givenName: 'Pierr',
            birthdate: '1992-03-03',
            birthPlace: '75107',
            birthCountry: '99100',
          },
        },
        rnippResponse: {
          code: 2,
          raw: formattedXml.xmlString,
        },
        supportId: '1234567891234567',
        csrfToken: 'mygreatcsrftoken',
      };

      rnippService.requestIdentityRectification.mockImplementationOnce(() => {
        return mockedRnippService;
      });

      const result = await rnippController.researchRnipp(
        rectificationRequest,
        req,
      );

      expect(result).toEqual(expectedResult);
    });

    it('Should return an axios error to the front if no data', async () => {
      const mockedRnippService = {
        rawResponse: 'No Data from rnipp',
        statusCode: 500,
        message: '',
      };

      const expectedResult: ErrorControllerInterface = {
        person: {
          requestedIdentity: identity,
        },
        rawResponse: 'No Data from rnipp',
        statusCode: 500,
        message: '',
        supportId: '1234567891234567',
        csrfToken: 'mygreatcsrftoken',
        rnippCode: '',
      };

      rnippService.requestIdentityRectification.mockImplementationOnce(() => {
        throw mockedRnippService;
      });

      const result = await rnippController.researchRnipp(
        rectificationRequest,
        req,
      );

      expect(result).toEqual(expectedResult);
    });

    it('Should return an axios error to the front', async () => {
      const mockedRnippService = {
        rawResponse: 'component',
        statusCode: 403,
        message: 'message',
      };

      const expectedResult: ErrorControllerInterface = {
        person: {
          requestedIdentity: identity,
        },
        rawResponse: 'component',
        statusCode: 403,
        message: 'message',
        supportId: '1234567891234567',
        csrfToken: 'mygreatcsrftoken',
        rnippCode: '',
      };

      rnippService.requestIdentityRectification.mockImplementationOnce(() => {
        throw mockedRnippService;
      });

      const result = await rnippController.researchRnipp(
        rectificationRequest,
        req,
      );

      expect(result).toEqual(expectedResult);
    });

    it('Should return array serialize error to the front', async () => {
      const mockedRnippService = {
        errors: [
          'familyName must be a string',
          'birthdate must be a valid ISO 8601 date string',
          'birthPlace must match /^[0-9]{5}$/ regular expression',
          'birthCountry must match /^[0-9]{5}$/ regular expression',
        ],
      };

      const expectedResult: ErrorControllerInterface = {
        person: {
          requestedIdentity: identity,
        },
        supportId: '1234567891234567',
        csrfToken: 'mygreatcsrftoken',
        message: [
          'familyName must be a string',
          'birthdate must be a valid ISO 8601 date string',
          'birthPlace must match /^[0-9]{5}$/ regular expression',
          'birthCountry must match /^[0-9]{5}$/ regular expression',
        ],
      };

      rnippService.requestIdentityRectification.mockImplementationOnce(() => {
        throw mockedRnippService;
      });

      const result = await rnippController.researchRnipp(
        rectificationRequest,
        req,
      );

      expect(result).toEqual(expectedResult);
    });
  });
});
