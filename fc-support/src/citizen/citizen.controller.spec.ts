import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CitizenController } from './citizen.controller';
import { CitizenService } from './citizen.service';
import { PatchCitizenActiveDTO } from './dto/patch-citizen-active.dto';
import { IIdentity } from '@fc/shared/citizen/interfaces/identity.interface';

describe('CitizenController', () => {
  let citizenController: CitizenController;
  let service: CitizenService;

  const citizenService = {
    getPivotIdentityHash: jest.fn(),
    findByHash: jest.fn(),
    createBlockedCitizen: jest.fn(),
    generateLegacyAccountId: jest.fn(),
    setActive: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [CitizenController, CitizenService],
    })
      .overrideProvider(CitizenService)
      .useValue(citizenService)
      .compile();

    citizenController = await module.get<CitizenController>(CitizenController);

    service = await module.get<CitizenService>(CitizenService);

    jest.resetAllMocks();
  });

  describe('getCitizenStatus', () => {
    it('Should return the citizen status and last connection date', async () => {
      // Given
      const identity: IIdentity = {
        givenName: 'georges',
        familyName: 'moustaki',
        preferredUsername: '',
        birthdate: '1934-01-01',
        gender: 'gender',
        birthPlace: '95277',
        birthCountry: '99100',
      };

      citizenService.getPivotIdentityHash.mockReturnValueOnce('foo');
      citizenService.findByHash.mockResolvedValueOnce({
        _id: 'baz',
        id: 'bar',
        identityHash: 'foo',
        active: true,
        updatedAt: '2019-06-01T12:34:56.000Z',
      });

      // When
      const result = await citizenController.getCitizenStatus(identity);
      // Then
      expect(result).toEqual({
        active: true,
        lastConnection: '2019-06-01T12:34:56.000Z',
      });
    });

    it('Should throw a 404 error if citizen not found', async () => {
      // Given
      const identity: IIdentity = {
        givenName: 'georges',
        familyName: 'moustaki',
        preferredUsername: '',
        birthdate: '1934-01-01',
        gender: 'gender',
        birthPlace: '95277',
        birthCountry: '99100',
      };
      citizenService.getPivotIdentityHash.mockReturnValueOnce('foo');
      citizenService.findByHash.mockResolvedValueOnce(false);

      // Then
      expect(citizenController.getCitizenStatus(identity)).rejects.toEqual(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
