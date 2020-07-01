import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { CitizenService } from './citizen.service';
import { Citizen } from '@fc/shared/citizen/citizen.mongodb.entity';
import { ConfigService } from 'nestjs-config';
import * as crypto from 'crypto';
import { LoggerService } from '@fc/shared/logger/logger.service';

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

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Citizen], 'fc-mongo')],
      providers: [CitizenService, Repository, cryptoProvider, LoggerService],
    })
      .overrideProvider(getRepositoryToken(Citizen, 'fc-mongo'))
      .useValue(citizenRepository)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
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
      // Given
      const hash = '5d4d6d29bbdfbd203da312f2';

      // When
      await citizenService.findByHash(hash);

      // Then
      expect(citizenRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });
});
