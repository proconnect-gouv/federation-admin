import { Test, TestingModule } from '@nestjs/testing';
import { RnippController } from './rnipp.controller';
import { RnippService } from './rnipp.service';
import { rawXml } from '../fixtures/xmlMockedString';
import { PersonRequestedDTO } from './dto/person-requested-input.dto';
import { PersonFoundDTO } from './dto/person-found-output.dto';
import { PersonFromRnipp } from './interface/personFromRnipp.interface';
import { ErrorControllerInterface } from './interface/error-controller.interface';
import { TraceService } from '@fc/shared/logger/trace.service';

describe('RnippController', () => {
  let rnippController: RnippController;

  const rnippService = {
    getJsonFromRnippApi: jest.fn(),
  };

  const identity: PersonRequestedDTO = {
    gender: 'male',
    familyName: 'Dupont',
    preferredUsername: 'Henri',
    givenName: 'Pierr',
    birthdate: '1992-03-03',
    birthPlace: '99100',
    birthCountry: '99100',
    supportId: '1234567891234567',
  };

  const req = {
    csrfToken: function csrfToken() {
      return 'mygreatcsrftoken';
    },
  };

  const loggerMock = {
    supportRnippCall: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RnippController],
      providers: [RnippService, TraceService],
    })
      .overrideProvider(RnippService)
      .useValue(rnippService)
      .overrideProvider(TraceService)
      .useValue(loggerMock)
      .compile();

    rnippController = module.get<RnippController>(RnippController);
    jest.resetAllMocks();
  });

  describe('researchRnipp', () => {
    it('should return an object of person', async () => {
      const mockedRnippService: PersonFromRnipp = {
        personFoundByRnipp: {
          gender: 'male',
          familyName: 'Dupont',
          preferredUsername: 'Henri',
          givenName: 'Pierr',
          birthdate: '1992-03-03',
          birthPlace: '99100',
          birthCountry: '99100',
          supportId: '1234567891234567',
        },
        rawResponse: rawXml.xmlString,
        rnippCode: 2,
        statusCode: 200,
      };

      const expectedResult: PersonFoundDTO = {
        person: {
          requested: {
            gender: 'male',
            familyName: 'Dupont',
            preferredUsername: 'Henri',
            givenName: 'Pierr',
            birthdate: '1992-03-03',
            birthPlace: '99100',
            birthCountry: '99100',
            supportId: '1234567891234567',
          },
          found: {
            gender: 'male',
            familyName: 'Dupont',
            preferredUsername: 'Henri',
            givenName: 'Pierr',
            birthdate: '1992-03-03',
            birthPlace: '99100',
            birthCountry: '99100',
            supportId: '1234567891234567',
          },
        },
        rnippResponse: {
          code: 2,
          raw: rawXml.xmlString,
        },
        csrfToken: 'mygreatcsrftoken',
      };

      rnippService.getJsonFromRnippApi.mockImplementationOnce(() => {
        return mockedRnippService;
      });

      const result = await rnippController.researchRnipp(identity, req);

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
          requested: identity,
        },
        rawResponse: 'No Data from rnipp',
        statusCode: 500,
        message: '',
        csrfToken: 'mygreatcsrftoken',
        rnippCode: '',
      };

      rnippService.getJsonFromRnippApi.mockImplementationOnce(() => {
        throw mockedRnippService;
      });

      const result = await rnippController.researchRnipp(identity, req);

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
          requested: identity,
        },
        rawResponse: 'component',
        statusCode: 403,
        message: 'message',
        csrfToken: 'mygreatcsrftoken',
        rnippCode: '',
      };

      rnippService.getJsonFromRnippApi.mockImplementationOnce(() => {
        throw mockedRnippService;
      });

      const result = await rnippController.researchRnipp(identity, req);

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
          requested: identity,
        },
        csrfToken: 'mygreatcsrftoken',
        message: [
          'familyName must be a string',
          'birthdate must be a valid ISO 8601 date string',
          'birthPlace must match /^[0-9]{5}$/ regular expression',
          'birthCountry must match /^[0-9]{5}$/ regular expression',
        ],
      };

      rnippService.getJsonFromRnippApi.mockImplementationOnce(() => {
        throw mockedRnippService;
      });

      const result = await rnippController.researchRnipp(identity, req);

      expect(result).toEqual(expectedResult);
    });
  });
});
