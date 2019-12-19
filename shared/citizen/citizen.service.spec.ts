import { Buffer } from 'buffer';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { CitizenServiceBase } from './citizen-base.service';
import { ConfigService } from 'nestjs-config';
import * as crypto from 'crypto';
import { TraceService } from '@fc/shared/logger/trace.service';

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
    supportUserAcountStatus: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [CitizenServiceBase, cryptoProvider, TraceService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(TraceService)
      .useValue(loggerProvider)
      .compile();

    citizenService = await module.get<CitizenServiceBase>(CitizenServiceBase);
    jest.resetAllMocks();
  });

  afterAll(async () => {
    module.close();
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
      expect(result).toBe('yeD9TZeZcVQM9LYWc5rPHTxG6eIe5wbTti9jFIGAGpw=');
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
      expect(result).toBe('JadmXz7R1OBtkBVanqGaOBL7N8itrx01Yi4U2viiN2k=');
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
