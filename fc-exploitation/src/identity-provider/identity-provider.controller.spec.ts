import { Test } from '@nestjs/testing';
import { IdentityProvider } from './identity-provider.entity';
import { IdentityProviderController } from './identity-provider.controller';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('IdentityProviderController', () => {
  let identityProviderController;
  const mockedIdentityProviderRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([IdentityProvider], 'fc-mongo')],
      providers: [IdentityProviderController, Repository],
    })
      .overrideProvider(getRepositoryToken(IdentityProvider, 'fc-mongo'))
      .useValue(mockedIdentityProviderRepository)
      .compile();

    identityProviderController = module.get<IdentityProviderController>(
      IdentityProviderController,
    );
    jest.resetAllMocks();
  });

  describe('list', () => {
    it('returns all the identity providers', async () => {
      const mockedIdentityProviders = [
        'la barbe',
        'de la femme',
        'à Georges Moustaki',
      ];
      mockedIdentityProviderRepository.find.mockResolvedValueOnce(
        mockedIdentityProviders,
      );

      const { identityProviders } = await identityProviderController.list();

      expect(identityProviders).toEqual(mockedIdentityProviders);
    });
  });
});
