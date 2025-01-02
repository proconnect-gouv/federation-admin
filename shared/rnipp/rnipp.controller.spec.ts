import { LoggerService } from '@fc/shared/logger/logger.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from 'nestjs-config';
import { formattedXml, rawXml } from '../fixtures/xmlMockedString';
import { PersonFoundDTO } from './dto/person-found-output.dto';
import { RectificationRequestDTO } from './dto/rectification-request.dto';
import { ErrorControllerInterface } from './interface/error-controller.interface';
import { IResponseFromRnipp } from './interface/response-from-rnipp.interface';
import { RnippController } from './rnipp.controller';
import { RnippService } from './rnipp.service';

describe('RnippController', () => {
  let rnippController: RnippController;

  const rnippService = {
    requestIdentityRectification: jest.fn(),
    buildIdentitiestoRectify: jest.fn(),
    getFilteredSearchResult: jest.fn(),
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

  const oidcIdentity = {
    gender: 'male',
    family_name: 'Dupont',
    preferred_username: 'Henri',
    given_name: 'Pierr',
    birthdate: '1992-03-03',
    birthplace: '75107',
    birthcountry: '99100',
  };

  const rectificationRequest = ({
    supportId: '1234567891234567',
    gender: 'male',
    familyName: 'Dupont',
    preferredUsername: 'Henri',
    givenName: 'Pierr',
    birthdate: '1992-03-03',
    isFrench: true,
    birthLocation: '75107',
    toIdentity: () => identity,
    toOidc: () => oidcIdentity,
  } as unknown) as RectificationRequestDTO;

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

  const configMock = {
    defaultValues: {},
    appName: 'FC_EXPLOITATION',
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RnippController],
      providers: [RnippService, LoggerService, ConfigService],
    })
      .overrideProvider(RnippService)
      .useValue(rnippService)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    rnippController = module.get<RnippController>(RnippController);
    jest.resetAllMocks();
  });

  describe('researchRnipp', () => {
    const identitiesToRectifyMock = [
      {
        gender: 'male',
        familyName: 'Dupont',
        preferredUsername: 'Henri',
        givenName: 'Pierr',
        birthdate: '1992-03-03',
        birthPlace: '75107',
        birthCountry: '99100',
      },
    ];

    it('should return an array of object of person and formatted XML from formatted XML', async () => {
      // Given
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
        rnippDead: false,
        statusCode: 200,
      };

      const filteredSearchResult = [
        {
          person: {
            rectifiedIdentity: {
              gender: 'male',
              familyName: 'Dupont',
              preferredUsername: 'Henri',
              givenName: 'Pierr',
              birthdate: '1992-03-03',
              birthPlace: '75107',
              birthCountry: '99100',
            },
            dead: false,
          },
          rnippResponse: {
            code: 2,
            raw: formattedXml.xmlString,
          },
        },
      ];

      const expectedResult: PersonFoundDTO = {
        appName: 'FC_EXPLOITATION',
        rectifyResponseCodes: {
          error: 4,
          found: 2,
          rectified: 3,
        },
        searchResults: filteredSearchResult,
        requestedIdentity: rectificationRequest,
        supportId: '1234567891234567',
        csrfToken: 'mygreatcsrftoken',
      };

      rnippService.buildIdentitiestoRectify.mockResolvedValue(
        identitiesToRectifyMock,
      );
      rnippService.requestIdentityRectification.mockImplementationOnce(() => {
        return mockedRnippService;
      });
      rnippService.getFilteredSearchResult.mockReturnValue(
        filteredSearchResult,
      );

      configServiceMock.get.mockReturnValueOnce(configMock);

      // When
      const result = await rnippController.researchRnipp(
        rectificationRequest,
        req,
      );

      // Then
      expect(result).toEqual(expectedResult);
    });

    it('should return error with formatted XML from raw XML', async () => {
      const mockedRnippService: any = {
        rawResponse: rawXml.xmlString,
        statusCode: 404,
        message: "Une erreur s'est produite lors de l'appel au RNIPP.",
        rnippCode: '2',
        identityHash: {
          idp: 'd12f4rg4thyjh8ytjyt8j4yte4gezg4zrg4zeh4etj4ry',
        },
      };

      const expectedResult: ErrorControllerInterface = {
        appName: 'FC_EXPLOITATION',
        csrfToken: 'mygreatcsrftoken',
        persons: [
          {
            rectifiedIdentity: identity,
            dead: false,
          },
        ],
        rawResponse: formattedXml.xmlString,
        rnippCode: '2',
        statusCode: 404,
        supportId: '1234567891234567',
        message: "Une erreur s'est produite lors de l'appel au RNIPP.",
      };

      rnippService.buildIdentitiestoRectify.mockResolvedValue(
        identitiesToRectifyMock,
      );
      rnippService.requestIdentityRectification.mockRejectedValue(
        mockedRnippService,
      );

      configServiceMock.get.mockReturnValueOnce(configMock);

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
        appName: 'FC_EXPLOITATION',
        persons: [
          {
            rectifiedIdentity: identity,
            dead: false,
          },
        ],
        rawResponse: 'No Data from rnipp',
        statusCode: 500,
        message: '',
        supportId: '1234567891234567',
        csrfToken: 'mygreatcsrftoken',
        rnippCode: '',
      };

      rnippService.buildIdentitiestoRectify.mockResolvedValue(
        identitiesToRectifyMock,
      );
      rnippService.requestIdentityRectification.mockImplementationOnce(() => {
        throw mockedRnippService;
      });

      configServiceMock.get.mockReturnValueOnce(configMock);

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
        appName: 'FC_EXPLOITATION',
        persons: [
          {
            rectifiedIdentity: identity,
            dead: false,
          },
        ],
        rawResponse: 'component',
        statusCode: 403,
        message: 'message',
        supportId: '1234567891234567',
        csrfToken: 'mygreatcsrftoken',
        rnippCode: '',
      };

      rnippService.buildIdentitiestoRectify.mockResolvedValue(
        identitiesToRectifyMock,
      );
      rnippService.requestIdentityRectification.mockImplementationOnce(() => {
        throw mockedRnippService;
      });

      configServiceMock.get.mockReturnValueOnce(configMock);

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
        appName: 'FC_EXPLOITATION',
        persons: [
          {
            rectifiedIdentity: identity,
            dead: false,
          },
        ],
        supportId: '1234567891234567',
        csrfToken: 'mygreatcsrftoken',
        message: [
          'familyName must be a string',
          'birthdate must be a valid ISO 8601 date string',
          'birthPlace must match /^[0-9]{5}$/ regular expression',
          'birthCountry must match /^[0-9]{5}$/ regular expression',
        ],
      };

      rnippService.buildIdentitiestoRectify.mockResolvedValue(
        identitiesToRectifyMock,
      );
      rnippService.requestIdentityRectification.mockImplementationOnce(() => {
        throw mockedRnippService;
      });

      configServiceMock.get.mockReturnValueOnce(configMock);

      const result = await rnippController.researchRnipp(
        rectificationRequest,
        req,
      );

      expect(result).toEqual(expectedResult);
    });
  });
});
