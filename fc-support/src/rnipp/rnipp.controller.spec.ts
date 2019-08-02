import { Test, TestingModule } from '@nestjs/testing';
import { RnippController } from './rnipp.controller';
import { RnippService } from './rnipp.service';
import * as rawXml from '../../test/xmlMockedString.json';
import { PersonRequestedDTO } from './dto/person-requested-input.dto';
import { PersonFoundDTO } from './dto/person-found-output.dto';
import { PersonFromRnipp } from './interface/personFromRnipp.interface';
import { ErrorControllerInterface } from './interface/error-controller.interface';

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RnippController],
      providers: [RnippService],
    })
      .overrideProvider(RnippService)
      .useValue(rnippService)
      .compile();

    rnippController = module.get<RnippController>(RnippController);
    jest.resetAllMocks();
  });

  describe('researchRnipp', () => {
    it('should return an object of person', async () => {
      const req = {
        csrfToken: function csrfToken() {
          return 'mygreatcsrftoken';
        },
      };

      const mockedRnippService: PersonFromRnipp = {
        personFoundByRnipp: {
          gender: 'male',
          familyName: 'Dupont',
          preferredUsername: 'Henri',
          givenName: 'Pierr',
          birthdate: '1992-03-03',
          birthPlace: '99100',
          birthCountry: '99100',
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
          },
          found: {
            gender: 'male',
            familyName: 'Dupont',
            preferredUsername: 'Henri',
            givenName: 'Pierr',
            birthdate: '1992-03-03',
            birthPlace: '99100',
            birthCountry: '99100',
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
        rawResponse: 'No Data from rnipp',
        statusCode: 500,
        message: '',
      };

      const req = {
        csrfToken: 'myCsurfToken',
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
        rawResponse: 'component',
        statusCode: 403,
        message: 'message',
      };

      const req = {
        csrfToken: 'myCsurfToken',
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
        message: [
          'familyName must be a string',
          'birthdate must be a valid ISO 8601 date string',
          'birthPlace must match /^[0-9]{5}$/ regular expression',
          'birthCountry must match /^[0-9]{5}$/ regular expression',
        ],
      };

      const req = {
        csrfToken: 'myCsurfToken',
      };

      rnippService.getJsonFromRnippApi.mockImplementationOnce(() => {
        throw mockedRnippService;
      });

      const result = await rnippController.researchRnipp(identity, req);

      expect(result).toEqual(expectedResult);
    });
  });
});
