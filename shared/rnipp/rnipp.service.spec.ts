import { createReadStream } from 'fs';
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { RnippService } from './rnipp.service';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { RnippSerializer } from './rnipp-serializer.service';
import { CitizenServiceBase } from '@fc/shared/citizen/citizen-base.service';
import { LoggerService } from '@fc/shared/logger/logger.service';
import { InseeCityDBInterface, InseeCountryDBInterface } from './interface';
import { RectificationRequestDTO } from './dto';

jest.mock('fs');

describe('RnippService (e2e)', () => {
  let rnippService: RnippService;

  const httpService = {
    get: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const rnippSerializerMock = {
    serializeXmlFromRnipp: jest.fn(),
  };

  const loggerMock = {
    info: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
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

  const cityData: InseeCityDBInterface[] = [
    {
      cog: '123',
      name: 'PARIS',
      arr: 'arr',
      abr: 'abr',
      cp: '75000',
      specificPlace: '',
    },
    {
      cog: '456',
      name: 'CORMEILLES EN PARISIS',
      arr: 'arr',
      abr: 'abr',
      cp: '95123',
      specificPlace: '',
    },
    {
      cog: '789',
      name: 'COURBEVOIE',
      arr: 'arr',
      abr: 'abr',
      cp: '92123',
      specificPlace: '',
    },
  ];

  const countryData: InseeCountryDBInterface[] = [
    {
      cog: '99100',
      name: 'FRANCE',
      oldName: '',
      oldGeographicCode: '',
      geographicCode: '',
    },
    {
      cog: '99139',
      name: 'PORTUGAL',
      oldName: '',
      oldGeographicCode: '',
      geographicCode: '',
    },
  ];

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
      .useValue(configServiceMock)
      .overrideProvider(RnippSerializer)
      .useValue(rnippSerializerMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(CitizenServiceBase)
      .useValue(citizenMock)
      .compile();

    rnippService = module.get<RnippService>(RnippService);

    jest.resetAllMocks();
    jest.restoreAllMocks();

    citizenMock.getPivotIdentityHash.mockReturnValue(
      'fhsekfeshsfefeefeseshjehkfhefsk',
    );
  });

  describe('onModuleInit', () => {
    beforeEach(() => {
      configServiceMock.get
        .mockReturnValueOnce({
          cityCSVPath: '/path.to.city.csv',
        })
        .mockReturnValueOnce({
          countryCSVPath: '/path/to/country.csv',
        });
    });

    it('should retrieve city csv data', async () => {
      // Given
      rnippService['csvParse'] = jest
        .fn()
        .mockReturnValueOnce(cityData)
        .mockReturnValueOnce(countryData);

      // When
      await rnippService.onModuleInit();

      // Then
      expect(rnippService['csvParse']).toHaveBeenCalledTimes(2);
      expect(rnippService['cityCSVparsed']).toEqual(cityData);
      expect(rnippService['countryCSVparsed']).toEqual(countryData);
    });

    it('should log an error if there is an error while reading the CSV files', async () => {
      // Given
      rnippService['csvParse'] = jest
        .fn()
        .mockRejectedValue(new Error('Read CSV error'));

      // When
      await rnippService.onModuleInit();

      // Then
      expect(loggerMock.error).toHaveBeenCalledWith(
        'Error reading the CSV file:',
        expect.any(Error),
      );
    });
  });

  describe(`getXmlFormRnippApi`, () => {
    it(`should return userInfo when called successfully`, async () => {
      const result: AxiosResponse<string> = {
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
        dead: true,
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
        rnippDead: personParsedData.dead,
        rawResponse: result.data,
        statusCode: result.status,
        identityHash: {
          idp: 'fhsekfeshsfefeefeseshjehkfhefsk',
          rnipp: 'fhsekfeshsfefeefeseshjehkfhefsk',
        },
      });
    });

    it(`should reject an error when called with not a 200 from rnipp`, async () => {
      const result: AxiosResponse<string> = {
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

  describe('findCogByLocationName', () => {
    beforeEach(() => {
      configServiceMock.get
        .mockReturnValueOnce({
          limit: 30,
          fieldsToSearch: ['fieldsToSearchCity'],
        })
        .mockReturnValueOnce({
          limit: 30,
          fieldsToSearch: ['fieldsToSearchCountry'],
        });
    });
    it('should return city data found by findAllCog and log technical info', async () => {
      // Given
      rnippService['findAllCog'] = jest
        .fn()
        .mockResolvedValue(['some city data']);
      rnippService['cityCSVparsed'] = cityData;

      // When
      const result = await rnippService['findCogByLocationName']('PARIS', true);

      expect(rnippService['findAllCog']).toHaveBeenCalledTimes(1);
      expect(rnippService['findAllCog']).toHaveBeenCalledWith(
        cityData,
        'PARIS',
        ['fieldsToSearchCity'],
      );
      expect(loggerMock.log).toHaveBeenCalledTimes(1);
      expect(loggerMock.log).toHaveBeenCalledWith({
        searchType: 'commune',
        birthLocation: 'PARIS',
        totalFound: 1,
      });
      expect(result).toEqual(['some city data']);
    });

    it('should return country data found by findAllCog and log technical info', async () => {
      // Given
      rnippService['findAllCog'] = jest
        .fn()
        .mockResolvedValue(['some country data']);
      rnippService['countryCSVparsed'] = countryData;

      // When
      const result = await rnippService['findCogByLocationName'](
        'PORTUGAL',
        false,
      );

      expect(rnippService['findAllCog']).toHaveBeenCalledTimes(1);
      expect(rnippService['findAllCog']).toHaveBeenCalledWith(
        countryData,
        'PORTUGAL',
        ['fieldsToSearchCountry'],
      );
      expect(loggerMock.log).toHaveBeenCalledTimes(1);
      expect(loggerMock.log).toHaveBeenCalledWith({
        searchType: 'pays',
        birthLocation: 'PORTUGAL',
        totalFound: 1,
      });
      expect(result).toEqual(['some country data']);
    });

    it('should return as maximum info the limit retrieved in config', async () => {
      // Given
      configServiceMock.get.mockReset().mockReturnValue({
        limit: 2,
        fieldsToSearch: ['fieldsToSearch'],
      });
      rnippService['findAllCog'] = jest
        .fn()
        .mockResolvedValue([
          '1st city data',
          '2nd city data',
          '3th city data',
          '4th city data',
        ]);
      rnippService['cityCSVparsed'] = cityData;

      // When
      const result = await rnippService['findCogByLocationName']('PARIS', true);

      // Then
      expect(result).toEqual(['1st city data', '2nd city data']);
    });
  });

  describe('csvParse', () => {
    it('should read the CSV file and resolve with results', async () => {
      // Given
      const csvFilePath = 'path/to/test.csv';
      const expectedResult = [{ col1: 'value1', col2: 'value2' }];
      const mockReadStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback({ col1: 'value1', col2: 'value2' }); // Mock des données
          } else if (event === 'end') {
            callback();
          } else if (event === 'error') {
            callback(new Error('Mocked error'));
          }
          return mockReadStream;
        }),
      };
      (createReadStream as jest.Mock).mockReturnValue(mockReadStream);

      // Then
      const result = await rnippService['csvParse'](csvFilePath);

      // Then
      expect(result).toEqual(expectedResult);
    });

    it('should reject with an error if the CSV file reading fails', async () => {
      // Given
      const csvFilePath = 'path/to/nonexistent.csv';
      const mockReadStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('Mocked error'));
          }
          return mockReadStream;
        }),
      };
      (createReadStream as jest.Mock).mockReturnValue(mockReadStream);

      // When / Then
      await expect(rnippService['csvParse'](csvFilePath)).rejects.toThrowError(
        'Mocked error',
      );
    });
  });

  describe('findAllCog', () => {
    it('should filter and return matching cities name', async () => {
      // Given
      const searchTerm = 'PARIS';
      const fieldsToSearch = ['name', 'cog'];
      const expected = [
        {
          cog: '123',
          name: 'PARIS',
          arr: 'arr',
          abr: 'abr',
          cp: '75000',
          specificPlace: '',
        },
        {
          cog: '456',
          name: 'CORMEILLES EN PARISIS',
          arr: 'arr',
          abr: 'abr',
          cp: '95123',
          specificPlace: '',
        },
      ];

      // when
      const result = await rnippService['findAllCog'](
        cityData,
        searchTerm,
        fieldsToSearch,
      );

      // Then
      expect(result).toEqual(expected);
    });

    it('should filter and return matching cities cog', async () => {
      // Given
      const searchTerm = '789';
      const fieldsToSearch = ['name', 'cog'];
      const expected = [
        {
          cog: '789',
          name: 'COURBEVOIE',
          arr: 'arr',
          abr: 'abr',
          cp: '92123',
          specificPlace: '',
        },
      ];

      // When
      const result = await rnippService['findAllCog'](
        cityData,
        searchTerm,
        fieldsToSearch,
      );

      // Then
      expect(result).toEqual(expected);
    });

    it('should filter and return matching countries name', async () => {
      // Given
      const searchTerm = 'FRANCE';
      const fieldsToSearch = ['name'];
      const expected = [
        {
          cog: '99100',
          name: 'FRANCE',
          oldName: '',
          oldGeographicCode: '',
          geographicCode: '',
        },
      ];

      // When
      const result = await rnippService['findAllCog'](
        countryData,
        searchTerm,
        fieldsToSearch,
      );

      // Then
      expect(result).toEqual(expected);
    });

    it('should return all data if handle empty searchTerm', async () => {
      // Given
      const searchTerm = '';
      const fieldsToSearch = ['name'];
      const expected = cityData;

      // When
      const result = await rnippService['findAllCog'](
        cityData,
        searchTerm,
        fieldsToSearch,
      );

      // Then
      expect(result).toEqual(expected);
    });

    it('should return empty array if handle empty fieldsToSearch', async () => {
      // Given
      const searchTerm = 'City A';
      const fieldsToSearch: string[] = ['foo'];

      // When
      const result = await rnippService['findAllCog'](
        cityData,
        searchTerm,
        fieldsToSearch,
      );

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('buildIdentitiestoRectify()', () => {
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

    beforeEach(() => {
      rnippService['findCogByLocationName'] = jest
        .fn()
        .mockResolvedValue([{ cog: 75107 }]);
    });

    it('should call method "findCogByLocationName" to retrieve all cog', async () => {
      // When
      await rnippService.buildIdentitiestoRectify(rectificationRequest);

      // Then
      expect(rnippService['findCogByLocationName']).toHaveBeenCalledTimes(1);
      expect(rnippService['findCogByLocationName']).toHaveBeenCalledWith(
        '75107',
        true,
      );
    });

    it('should return identities with all cog found', async () => {
      // Given
      const expectedResult = [
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
      // When
      const result = await rnippService.buildIdentitiestoRectify(
        rectificationRequest,
      );

      // Then
      expect(result).toEqual(expectedResult);
    });
  });
});
