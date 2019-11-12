import { Buffer } from 'buffer';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { CitizenService } from './citizen.service';
import { Citizen } from './citizen.mongodb.entity';
import { ConfigService } from 'nestjs-config';
import * as crypto from 'crypto';
import { TraceService } from '@fc/shared/logger/trace.service';

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

  const LogActions = {
    ACTIVATE_ACCOUNT: 'activate_account',
    DESACTIVATE_ACCOUNT: 'desactivate_account',
    CREATE_BLOCKED_ACCOUNT: 'create_blocked_account',
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Citizen], 'fc-mongo')],
      providers: [CitizenService, Repository, cryptoProvider, TraceService],
    })
      .overrideProvider(getRepositoryToken(Citizen, 'fc-mongo'))
      .useValue(citizenRepository)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(TraceService)
      .useValue(loggerProvider)
      .compile();

    citizenService = await module.get<CitizenService>(CitizenService);
    jest.resetAllMocks();
  });

  afterAll(async () => {
    module.close();
  });

  describe('findByHash', () => {
    it('should find a citizen in mongodb', async () => {
      const hash = '5d4d6d29bbdfbd203da312f2';
      await citizenService.findByHash(hash);
      expect(citizenRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCitizenHash', () => {
    it('Should return a hash of given infos', () => {
      // Given
      const citizen = {
        givenName: 'georges',
        familyName: 'moustaki',
        birthdate: new Date('1934-01-01'),
        gender: 'gender',
        birthPlace: 99,
        birthCountry: 99,
        supportId: '1234567891011121',
      };
      // When
      const result = citizenService.getCitizenHash(citizen);
      // Then
      expect(result).toBe('0bEYSUw1htXph3WBFy+oEJZtRTab7SjejflD8xiRAL8=');
    });

    it('Should return a different hash for different infos', () => {
      // Given
      const citizen = {
        givenName: 'georgette',
        familyName: 'moustaki',
        birthdate: new Date('1934-01-01'),
        gender: 'gender',
        birthPlace: 99,
        birthCountry: 99,
        supportId: '1234567891011121',
      };
      // When
      const result = citizenService.getCitizenHash(citizen);
      // Then
      expect(result).toBe('sBQ1pJVX88wVSyK5HfnmWPREqeVVGE66gygQn+ITV+I=');
    });
  });

  describe('setActive', () => {
    it('Should desactivate existing citizen', async () => {
      // Given
      const hash = 'foo';
      const active = false;
      const supportId = '1234567891011121';
      const user = {
        username: 'Toto',
      };
      citizenRepository.findOne.mockResolvedValueOnce({
        id: 'foobar',
        identityHash: hash,
        active: true,
        updatedAt: '2019-01-03T12:34:56.000Z',
      });
      // When
      await citizenService.setActive(hash, active, supportId, user);
      // Then
      expect(citizenRepository.findOne).toHaveBeenCalledTimes(1);
      expect(citizenRepository.findOne).toHaveBeenCalledWith({
        identityHash: hash,
      });
      expect(loggerProvider.supportUserAcountStatus).toHaveBeenCalledTimes(1);
      expect(loggerProvider.supportUserAcountStatus).toHaveBeenCalledWith({
        action: LogActions.DESACTIVATE_ACCOUNT,
        user: user.username,
        motif: `ticket support : ${supportId}`,
        accountId: 'foobar',
      });
      expect(citizenRepository.save).toHaveBeenCalledTimes(1);
      expect(citizenRepository.save).toHaveBeenCalledWith({
        id: 'foobar',
        identityHash: hash,
        active,
        updatedAt: '2019-01-03T12:34:56.000Z',
      });
    });
    it('Should activate existing citizen', async () => {
      // Given
      const hash = 'foo';
      const active = true;
      const supportId = '1234567891011121';
      const user = {
        username: 'Toto',
      };

      citizenRepository.findOne.mockResolvedValueOnce({
        id: 'foobar',
        identityHash: hash,
        active: false,
        updatedAt: '2019-01-03T12:34:56.000Z',
      });
      // When
      await citizenService.setActive(hash, active, supportId, user);
      // Then
      expect(citizenRepository.findOne).toHaveBeenCalledTimes(1);
      expect(citizenRepository.findOne).toHaveBeenCalledWith({
        identityHash: hash,
      });
      expect(loggerProvider.supportUserAcountStatus).toHaveBeenCalledTimes(1);
      expect(loggerProvider.supportUserAcountStatus).toHaveBeenCalledWith({
        action: LogActions.ACTIVATE_ACCOUNT,
        user: user.username,
        motif: `ticket support : ${supportId}`,
        accountId: 'foobar',
      });
      expect(citizenRepository.save).toHaveBeenCalledTimes(1);
      expect(citizenRepository.save).toHaveBeenCalledWith({
        id: 'foobar',
        identityHash: hash,
        active,
        updatedAt: '2019-01-03T12:34:56.000Z',
      });
    });
  });

  describe('createBlockedCitizen', () => {
    it('Should create a new citizen with active set to false', async () => {
      // Given
      const citizen = {
        givenName: 'georges',
        familyName: 'moustaki',
        birthdate: new Date('1934-01-01'),
        gender: 'gender',
        birthPlace: 99,
        birthCountry: 99,
        supportId: '1234567891011121',
      };
      const identityHash = 'myHash';
      const id = 'myLegacyId';
      const req = {
        user: { username: 'Toto' },
      };
      citizenService.getCitizenHash = () => identityHash;
      citizenService.generateLegacyAccountId = () => id;
      // When
      await citizenService.createBlockedCitizen(citizen, req.user);
      // Then
      expect(loggerProvider.supportUserAcountStatus).toHaveBeenCalledWith({
        action: LogActions.CREATE_BLOCKED_ACCOUNT,
        user: req.user.username,
        motif: `ticket support : ${citizen.supportId}`,
        accountId: 'myLegacyId',
      });
      expect(citizenRepository.save).toHaveBeenCalledTimes(1);
      expect(citizenRepository.save).toHaveBeenCalledWith({
        id,
        active: false,
        identityHash,
      });
    });
  });

  describe('generateLegacyAccountId', () => {
    it('Should return a sha256', () => {
      // When
      const result = citizenService.generateLegacyAccountId();
      // Then
      expect(typeof result).toBe('string');
      // We are using the hex representation of a sha256 here,
      // So 4 bytes by chars.
      expect(Buffer.from(result).length * 4).toBe(256);
    });

    it('Should not return twice the same result', () => {
      // When
      const values = [
        citizenService.generateLegacyAccountId(),
        citizenService.generateLegacyAccountId(),
        citizenService.generateLegacyAccountId(),
        citizenService.generateLegacyAccountId(),
        citizenService.generateLegacyAccountId(),
        citizenService.generateLegacyAccountId(),
        citizenService.generateLegacyAccountId(),
      ];
      // Then
      values.forEach(value => {
        // Get the number of times value appears in array
        const occurences = values.filter(value2 => value2 === value).length;
        expect(occurences).toBe(1);
      });
    });
  });
});
