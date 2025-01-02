import * as Fuse from 'fuse.js/dist/fuse.common';

import { CitizenServiceBase } from '@fc/shared/citizen/citizen-base.service';
import { LoggerService } from '@fc/shared/logger/logger.service';
import { HttpService } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { createReadStream } from 'fs';
import { ConfigService } from 'nestjs-config';
import { of } from 'rxjs';
import { RectificationRequestDTO } from './dto';
import {
  InseeCityDBInterface,
  InseeCountryDBInterface,
  Personfound,
} from './interface';
import { RnippSerializer } from './rnipp-serializer.service';
import { RnippService } from './rnipp.service';
import { RNIPP_IDENTITY_RESPONSE_CODES } from './rnipp-constants';

jest.mock('fs');
jest.mock('fuse.js');

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

      jest.spyOn(loggerMock, 'info');
      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(result));
      jest
        .spyOn(rnippSerializerMock, 'serializeXmlFromRnipp')
        .mockImplementation(() => Promise.resolve(personParsedData));

      const person = await rnippService.requestIdentityRectification(
        personParsedData.identity,
      );

      expect(person).toStrictEqual({
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

    it(`should return a falsey userInfo when identity is not found`, async () => {
      // given
      const result: AxiosResponse<string> = {
        data: 'Components',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      const personParsedData = {
        identity: null,
        rnippCode: '8',
        dead: expect.any(Boolean),
      };

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(result));
      jest
        .spyOn(rnippSerializerMock, 'serializeXmlFromRnipp')
        .mockImplementation(() => Promise.resolve(personParsedData));

      // when
      const results = await rnippService.requestIdentityRectification(
        personData,
      );

      // then
      expect(results).toStrictEqual({
        rectifiedIdentity: personData,
        rnippDead: false,
        rnippCode: '8',
        rawResponse: result.data,
        statusCode: result.status,
        identityHash: {
          idp: expect.any(String),
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
        expect(error).toStrictEqual({
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
        expect(error).toStrictEqual({
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
        expect(error).toStrictEqual({
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
    it('should return city data found by findAllCog', async () => {
      // Given
      rnippService['findAllCog'] = jest
        .fn()
        .mockReturnValue(['some city data']);
      rnippService['cityCSVparsed'] = cityData;

      // When
      const result = await rnippService['findCogByLocationName']('PARIS', true);

      expect(rnippService['findAllCog']).toHaveBeenCalledTimes(1);
      expect(rnippService['findAllCog']).toHaveBeenCalledWith(
        cityData,
        'PARIS',
        ['fieldsToSearchCity'],
      );
      expect(result).toEqual(['some city data']);
    });

    it('should return country data found by findAllCog', async () => {
      // Given
      rnippService['findAllCog'] = jest
        .fn()
        .mockReturnValue(['some country data']);
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
        .mockReturnValue([
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
    const searchTerm = 'PARIS';
    const fieldsToSearch = ['name', 'cog'];
    const dataMock = [
      {
        cog: '456',
        name: 'CORMEILLES EN PARISIS',
        arr: 'arr',
        abr: 'abr',
        cp: '95123',
        specificPlace: '',
      },
      {
        cog: '123',
        name: 'PARIS',
        arr: 'arr',
        abr: 'abr',
        cp: '75000',
        specificPlace: '',
      },
      {
        cog: '938',
        name: 'ANOTHER ONE BITE THE DUST',
        arr: 'arr',
        abr: 'abr',
        cp: '98696',
        specificPlace: '',
      },
    ];
    const resultsMock = [
      {
        item: {
          cog: '456',
          name: 'CORMEILLES EN PARISIS',
          arr: 'arr',
          abr: 'abr',
          cp: '95123',
          specificPlace: '',
        },
      },
      {
        item: {
          cog: '123',
          name: 'PARIS',
          arr: 'arr',
          abr: 'abr',
          cp: '75000',
          specificPlace: '',
        },
      },
    ];

    const searchMock = jest.fn();

    beforeEach(() => {
      Fuse.mockImplementation(function construct() {
        return {
          search: searchMock,
        };
      });

      searchMock.mockReturnValue(resultsMock);
    });

    it('should instantiate fuse', () => {
      // When
      rnippService['findAllCog'](dataMock, searchTerm, fieldsToSearch);

      // Then
      expect(Fuse).toHaveBeenCalledTimes(1);
      expect(Fuse).toHaveBeenCalledWith(dataMock, {
        keys: fieldsToSearch,
        shouldSort: true,
        threshold: 0,
      });
    });

    it('should search using fuse', () => {
      // When
      rnippService['findAllCog'](dataMock, searchTerm, fieldsToSearch);

      // Then
      expect(searchMock).toHaveBeenCalledTimes(1);
      expect(searchMock).toHaveBeenCalledWith(searchTerm);
    });

    it('should return the results', () => {
      // Given
      const expected = [
        {
          abr: 'abr',
          arr: 'arr',
          cog: '456',
          cp: '95123',
          name: 'CORMEILLES EN PARISIS',
          specificPlace: '',
        },
        {
          abr: 'abr',
          arr: 'arr',
          cog: '123',
          cp: '75000',
          name: 'PARIS',
          specificPlace: '',
        },
      ];

      // When
      const result = rnippService['findAllCog'](
        dataMock,
        searchTerm,
        fieldsToSearch,
      );

      // Then
      expect(result).toStrictEqual(expected);
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

    it('should not call method "findCogByLocationName" if already a cog', async () => {
      // When
      await rnippService.buildIdentitiestoRectify(rectificationRequest);

      // Then
      expect(rnippService['findCogByLocationName']).toHaveBeenCalledTimes(0);
    });

    it('should resolve one result if already a cog', async () => {
      // When
      const result = await rnippService.buildIdentitiestoRectify(
        rectificationRequest,
      );

      // Then
      expect(result).toStrictEqual([identity]);
    });

    it('should call method "findCogByLocationName" if not a cog', async () => {
      // Given
      const rectificationRequestCog = ({
        ...rectificationRequest,
        birthLocation: 'test',
      } as unknown) as RectificationRequestDTO;

      // When
      await rnippService.buildIdentitiestoRectify(rectificationRequestCog);

      // Then
      expect(rnippService['findCogByLocationName']).toHaveBeenCalledTimes(1);
      expect(rnippService['findCogByLocationName']).toHaveBeenCalledWith(
        rectificationRequestCog.birthLocation,
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

  describe('getFilteredSearchResult', () => {
    it('should return person found', () => {
      // Given
      const personMock = ([
        {
          person: { rectifiedIdentity: { ...personData } },
          rnippResponse: { code: RNIPP_IDENTITY_RESPONSE_CODES.found },
        },
        {
          person: { rectifiedIdentity: { ...personData } },
          rnippResponse: { code: RNIPP_IDENTITY_RESPONSE_CODES.error },
        },
      ] as unknown) as Personfound[];

      const expected = ([
        {
          person: { rectifiedIdentity: { ...personData } },
          rnippResponse: { code: RNIPP_IDENTITY_RESPONSE_CODES.found },
        },
      ] as unknown) as Personfound[];

      // When
      const result = rnippService.getFilteredSearchResult(personMock);

      // Then
      expect(result).toStrictEqual(expected);
    });

    it('should return person rectified', () => {
      // Given
      const personMock = ([
        {
          person: { rectifiedIdentity: { ...personData } },
          rnippResponse: { code: RNIPP_IDENTITY_RESPONSE_CODES.rectified },
        },
        {
          person: { rectifiedIdentity: { ...personData } },
          rnippResponse: { code: RNIPP_IDENTITY_RESPONSE_CODES.error },
        },
      ] as unknown) as Personfound[];

      const expected = ([
        {
          person: { rectifiedIdentity: { ...personData } },
          rnippResponse: { code: RNIPP_IDENTITY_RESPONSE_CODES.rectified },
        },
      ] as unknown) as Personfound[];

      // When
      const result = rnippService.getFilteredSearchResult(personMock);

      // Then
      expect(result).toStrictEqual(expected);
    });

    it('should return person found & rectified', () => {
      // Given
      const personMock = ([
        {
          person: { rectifiedIdentity: { ...personData } },
          rnippResponse: { code: RNIPP_IDENTITY_RESPONSE_CODES.found },
        },
        {
          person: { rectifiedIdentity: { ...personData } },
          rnippResponse: { code: RNIPP_IDENTITY_RESPONSE_CODES.rectified },
        },
      ] as unknown) as Personfound[];

      // When
      const result = rnippService.getFilteredSearchResult(personMock);

      // Then
      expect(result).toStrictEqual(personMock);
    });

    it('should return all other rnipp code error when a result with the found code exists', () => {
      // Given
      const personMock = ([
        {
          person: { rectifiedIdentity: { ...personData } },
          rnippResponse: { code: RNIPP_IDENTITY_RESPONSE_CODES.error },
        },
      ] as unknown) as Personfound[];

      // When
      const result = rnippService.getFilteredSearchResult(personMock);

      // Then
      expect(result).toStrictEqual(personMock);
    });
  });
});
