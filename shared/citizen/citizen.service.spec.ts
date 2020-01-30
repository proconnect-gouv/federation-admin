import { Buffer } from 'buffer';
import { Test, TestingModule } from '@nestjs/testing';
import { CitizenServiceBase } from './citizen-base.service';
import { ConfigService } from 'nestjs-config';
import * as crypto from 'crypto';
import { LoggerService } from '@fc/shared/logger/logger.service';

describe('CitizenService', () => {
  let module: TestingModule;
  let citizenService: CitizenServiceBase;

  const configServiceMock = {
    get: jest.fn(),
  };

  const cryptoProvider = {
    provide: 'cryptoProvider',
    useValue: crypto,
  };

  const loggerProvider = {
    info: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [CitizenServiceBase, cryptoProvider, LoggerService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerProvider)
      .compile();

    citizenService = await module.get<CitizenServiceBase>(CitizenServiceBase);
    jest.resetAllMocks();
  });

  afterAll(async () => {
    module.close();
  });

  describe('getPivotIdentityHash', () => {
    it('Should return a hash of given infos', () => {
      // Given
      const citizen = {
        givenName: 'georges',
        familyName: 'moustaki',
        birthdate: '1934-01-01',
        gender: 'gender',
        birthPlace: '95277',
        birthCountry: '99100',
      };
      // When
      const hash = citizenService.getPivotIdentityHash(citizen);
      // Then
      expect(hash).toBe('d4gaTT4PZCaIDYpACTY0yMlv2NjpKRMIHBnin+N79fI=');
    });

    it('Should return a different hash for different infos', () => {
      // Given
      const citizen = {
        givenName: 'georgette',
        familyName: 'moustaki',
        birthdate: '1934-01-01',
        gender: 'gender',
        birthPlace: '95277',
        birthCountry: '99100',
      };
      // When
      const hash = citizenService.getPivotIdentityHash(citizen);
      // Then
      expect(hash).toBe('WX6WdY6CfPSGAhfw0+hZhN7fLHRlcFRQGQU0H0a2VA8=');
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
