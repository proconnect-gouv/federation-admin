import { LoggerService } from '@fc/shared/logger/logger.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Buffer } from 'buffer';
import * as crypto from 'crypto';
import { ConfigService } from 'nestjs-config';
import { CitizenServiceBase } from './citizen-base.service';

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

  describe('rectifyIfPartialBirthdate', () => {
    it('should add "-01-01" if the brithdate is formatted "YYYY"', () => {
      // setup
      const birthdate = '1992';
      const expected = '1992-01-01';

      // action
      // To test the private we must use this syntax
      // tslint:disable-next-line: no-string-literal
      const result = citizenService['rectifyIfPartialBirthdate'](birthdate);

      // expect
      expect(result).toStrictEqual(expected);
    });

    it('should add "-01" if the brithdate is formatted "YYYY-MM"', () => {
      // setup
      const birthdate = '1992-11';
      const expected = '1992-11-01';

      // action
      // To test the private we must use this syntax
      // tslint:disable-next-line: no-string-literal
      const result = citizenService['rectifyIfPartialBirthdate'](birthdate);

      // expect
      expect(result).toStrictEqual(expected);
    });

    it('should not modify a date formatted "YYYY-MM-DD"', () => {
      // setup
      const birthdate = '1992-04-23';
      const expected = '1992-04-23';

      // action
      // To test the private we must use this syntax
      // tslint:disable-next-line: no-string-literal
      const result = citizenService['rectifyIfPartialBirthdate'](birthdate);

      // expect
      expect(result).toStrictEqual(expected);
    });
  });

  describe('generateOIDCIdentity', () => {
    it('should return a legacy formated idp', () => {
      // given
      const expected = {
        given_name: 'foo',
        family_name: 'foo',
        birthdate: 'foo',
        gender: 'foo',
        birthcountry: 'foo',
        birthplace: 'foo',
      };

      // Then
      const result = citizenService.generateOIDCIdentity({
        givenName: 'foo',
        familyName: 'foo',
        birthdate: 'foo',
        gender: 'foo',
        birthCountry: 'foo',
        birthPlace: 'foo',
      });

      // Expected
      expect(result).toStrictEqual(expected);
    });
  });
});
