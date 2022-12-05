import { Citizen } from '@fc/shared/citizen/citizen.mongodb.entity';
import { LoggerService } from '@fc/shared/logger/logger.service';
import { UserPreferencesService } from '@fc/shared/user-preferences';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { ConfigService } from 'nestjs-config';
import { Repository } from 'typeorm';
import { CitizenService } from './citizen.service';

describe('CitizenService', () => {
  let module: TestingModule;
  let citizenService: CitizenService;

  const configServiceMock = {
    get: jest.fn(),
  };

  const citizenRepository = {
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const cryptoProvider = {
    provide: 'cryptoProvider',
    useValue: crypto,
  };

  const loggerProvider = {
    supportUserAcountStatus: jest.fn(),
  };

  const brokerMock = {
    publish: jest.fn(),
  };

  const brokerMockResponse = {
    allowFutureIdp: false,
    idpList: [
      {
        uid: 'idp_uid',
        name: 'idp',
        image: 'idp.png',
        title: 'IDP',
        active: true,
        isChecked: true,
      },
      {
        uid: 'idp_uid',
        name: 'idp',
        image: 'idp.png',
        title: 'IDP',
        active: true,
        isChecked: true,
      },
    ],
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Citizen], 'fc-mongo')],
      providers: [
        CitizenService,
        Repository,
        cryptoProvider,
        LoggerService,
        UserPreferencesService,
      ],
    })
      .overrideProvider(getRepositoryToken(Citizen, 'fc-mongo'))
      .useValue(citizenRepository)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerProvider)
      .overrideProvider(UserPreferencesService)
      .useValue(brokerMock)
      .compile();

    citizenService = await module.get<CitizenService>(CitizenService);
    jest.resetAllMocks();
  });

  afterAll(async () => {
    module.close();
  });

  describe('findByHash', () => {
    it('should find a citizen in mongodb', async () => {
      // Given
      const hash = '5d4d6d29bbdfbd203da312f2';

      // When
      await citizenService.findByHash(hash);

      // Then
      expect(citizenRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('findIdpPreferences', () => {
    it('should call rectifyIfPartialBirthdate', async () => {
      // Given
      const userIdentity = {
        givenName: 'givenName',
        familyName: 'familyName',
        birthdate: 'birthdate',
        gender: 'gender',
        preferred_username: 'preferredUsername',
        birthCountry: 'birthCountry',
        birthPlace: 'birthPlace',
      };
      citizenService.rectifyIfPartialBirthdate = jest.fn();

      // When
      const result = await citizenService.findIdpPreferences(userIdentity);

      // Then
      expect(citizenService.rectifyIfPartialBirthdate).toHaveBeenCalledTimes(1);
      expect(citizenService.rectifyIfPartialBirthdate).toHaveBeenCalledWith(
        userIdentity.birthdate,
      );
    });

    it('should call generateOIDCIdentity', async () => {
      // Given
      brokerMock.publish.mockResolvedValue(brokerMockResponse);
      const userIdentity = {
        givenName: 'givenName',
        familyName: 'familyName',
        birthdate: 'birthdate',
        gender: 'gender',
        preferred_username: 'preferredUsername',
        birthCountry: 'birthCountry',
        birthPlace: 'birthPlace',
      };
      const rectifiedBirthdate = 'return-value-mock';
      citizenService.rectifyIfPartialBirthdate = jest
        .fn()
        .mockReturnValue(rectifiedBirthdate);
      citizenService.generateOIDCIdentity = jest.fn();

      // When
      const result = await citizenService.findIdpPreferences(userIdentity);

      // Then
      expect(citizenService.generateOIDCIdentity).toHaveBeenCalledTimes(1);
      expect(citizenService.generateOIDCIdentity).toHaveBeenCalledWith({
        ...userIdentity,
        birthdate: rectifiedBirthdate,
      });
    });

    it('should get a user idp setting', async () => {
      // Given
      const expected = {
        allowFutureIdp: false,
        idpList: [
          {
            uid: 'idp_uid',
            name: 'idp',
            image: 'idp.png',
            title: 'IDP',
            active: true,
            isChecked: true,
          },
          {
            uid: 'idp_uid',
            name: 'idp',
            image: 'idp.png',
            title: 'IDP',
            active: true,
            isChecked: true,
          },
        ],
      };

      const userIdentity = {
        givenName: 'givenName',
        familyName: 'familyName',
        birthdate: 'birthdate',
        gender: 'gender',
        preferred_username: 'preferredUsername',
        birthCountry: 'birthCountry',
        birthPlace: 'birthPlace',
      };
      brokerMock.publish.mockResolvedValue(brokerMockResponse);

      // When
      const result = await citizenService.findIdpPreferences(userIdentity);

      // Then
      expect(brokerMock.publish).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(expected);
    });
  });
});
