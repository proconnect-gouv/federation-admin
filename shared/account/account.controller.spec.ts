import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@fc/shared/user/roles.enum';
import { UserService } from '@fc/shared/user/user.service';
import { User } from '@fc/shared/user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { EnrollUserDto } from './dto/enroll-user.dto';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { TotpService } from '@fc/shared/authentication/totp/totp.service';

describe('AccountController', () => {
  let accountController: AccountController;
  let service: AccountService;

  const serviceMock = {
    paginate: jest.fn(),
  };

  const userService = {
    compareHash: jest.fn(),
    findByUsername: jest.fn(),
    createUser: jest.fn(),
    deleteUserById: jest.fn(),
    generateTmpPass: jest.fn(),
    enrollUser: jest.fn(),
  };
  const res = {
    redirect: jest.fn(),
    status: jest.fn(),
    render: jest.fn(),
    locals: {
      APP_ROOT: '/foo/bar',
    },
  };

  const totpService = {
    generateTotpQRCode: jest.fn(),
    generateTotpSecret: jest.fn(),
  };
  const req = {
    flash: jest.fn(),
    user: {
      id: '05e4fadf-fda6-4ad8-ae75-b7f315843827',
      roles: [],
    },
    body: {
      roles: ['admin', 'operator'],
      secret: jest.fn(),
    },
    csrfToken: function csrfToken() {
      return 'mygreatcsrftoken';
    },
  };

  const createUserDto = new CreateUserDto(
    'jean_moust',
    'jean@moust.lol',
    'yolo',
    [UserRole.OPERATOR],
    '1234',
  );
  const enrollUserDto = new EnrollUserDto(
    'YouWontFindIt#999',
    'YouWontFindIt#999',
  );
  const userRepository = {
    find: jest.fn(),
  };

  const mockedGeneratePassword = {
    generate: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([User])],
      controllers: [AccountController],
      providers: [
        UserService,
        TotpService,
        AccountService,
        {
          provide: getRepositoryToken(AccountService),
          useClass: Repository,
        },
        { provide: 'generatePassword', useValue: mockedGeneratePassword },
      ],
    })
      .overrideProvider(UserService)
      .useValue(userService)
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepository)
      .overrideProvider(AccountService)
      .useValue(serviceMock)
      .overrideProvider(TotpService)
      .useValue(totpService)
      .compile();

    accountController = module.get<AccountController>(AccountController);
    service = await module.get<AccountService>(AccountService);

    jest.resetAllMocks();
    totpService.generateTotpQRCode.mockReturnValueOnce({
      user: 'toto',
      issuer: 'fce',
      secret: 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
      QRCode: 'base64ImageQRCode',
      step: 30,
      algorithm: 'sha1',
    });
    totpService.generateTotpSecret.mockReturnValueOnce(
      'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
    );
    res.status.mockReturnValueOnce(res);
    mockedGeneratePassword.generate.mockReturnValueOnce('mygreattmppassword');
  });

  describe('list', () => {
    it('returns all the users', async () => {
      // Setup
      const page = '0';
      const limit = '10';

      // Mocking Items
      const itemTest1: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest2: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest3: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest4: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest5: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest6: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest7: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest8: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest9: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest10: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest11: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };
      const itemTest12: User = {
        id: '5d35b91e70332098440d0f85',
        username: 'kizaru',
        email: 'kizaru@onepiece.com',
        roles: [],
        passwordHash: '54689adfrt',
        secret: '1234',
      };

      // Mocking return value of serviceProviderController.list(page, limit)
      const user = {
        items: [
          itemTest1,
          itemTest2,
          itemTest3,
          itemTest4,
          itemTest5,
          itemTest6,
          itemTest7,
          itemTest8,
          itemTest9,
          itemTest10,
          itemTest11,
          itemTest12,
        ],
        itemCount: 12,
        totalItems: 12,
        totalUsers: 12,
        pageCount: 2,
        next: '/account?page=2&limit=10',
        previous: '',
      };

      // Actions
      // Mocking the return of the paginate function
      const result: Promise<Pagination<User>> = Promise.resolve(user);

      // Mocking the return of service paginte function
      const spy = jest
        .spyOn(service, 'paginate')
        .mockImplementation(() => Promise.resolve(result));

      // Calling the list function
      const resultat = await accountController.list(req, page, limit);

      // Expected
      expect(spy).toHaveBeenCalled();
      expect(resultat.totalUsers).toEqual(12);
      expect(resultat.pages).toEqual(2);
      expect(resultat.users.length).toEqual(12);
      expect(resultat.next).toEqual('/account?page=2&limit=10');
    });
  });

  describe('createUser', () => {
    it('Get create user', () => {
      // setup
      userService.generateTmpPass.mockImplementationOnce(() => {
        return 'mygreattmppassword';
      });
      // action
      const { csrfToken, tmpPassword } = accountController.showCreationForm(
        req,
      );
      // assertion
      expect(userService.generateTmpPass).toHaveBeenCalledTimes(1);
      expect(csrfToken).toEqual('mygreatcsrftoken');
      expect(tmpPassword).toEqual('mygreattmppassword');
    });
  });
  describe('Post create user', () => {
    it('redirects the user when a valid user is provided', async () => {
      // setup
      userService.createUser.mockImplementation(() => Promise.resolve(true));
      // action
      await accountController.createUser(createUserDto, req, res);
      // assertion
      expect(req.body.roles[0]).toContain('inactive_');
      expect(req.body.roles[1]).toContain('inactive_');
      expect(req.body.roles).toContain('new_account');
      expect(req.body.secret).toEqual('KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD');
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account');
    });

    it('uses the user service to create users', async () => {
      await accountController.createUser(createUserDto, req, res);

      expect(userService.createUser).toHaveBeenCalledTimes(1);
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it('falls back in the catch when a not valid user is provided', async () => {
      // setup
      userService.createUser.mockImplementation(() =>
        Promise.reject(new Error('wrong, buddy')),
      );
      // action
      await accountController.createUser(createUserDto, req, res);
      // assertion
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account/create');
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledWith('globalError', { code: '23505' });
    });
  });

  describe('get enrollment', () => {
    it('should generate qr code and return values to enter totp code without scanning qrcode', async () => {
      // action
      const {
        user,
        issuer,
        secret,
        QRCode,
        step,
        algorithm,
        csrfToken,
      } = await accountController.firstLogin(req, res);
      // assertion
      expect(user).toEqual('toto');
      expect(issuer).toEqual('fce');
      expect(secret).toEqual('KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD');
      expect(QRCode).toEqual('base64ImageQRCode');
      expect(step).toEqual(30);
      expect(algorithm).toEqual('sha1');
      expect(csrfToken).toEqual('mygreatcsrftoken');
    });
  });

  describe('Patch enrollment new User', () => {
    it("'should update a new user and redirect to service-providers' page if the user has the role opreator", async () => {
      // setup
      req.user.roles = ['operator'];
      userService.enrollUser.mockImplementation(() => Promise.resolve(true));
      // action
      await accountController.enrollUser(enrollUserDto, req, res);
      // assertion
      expect(userService.enrollUser).toHaveBeenCalledTimes(1);
      expect(userService.enrollUser).toHaveBeenCalledWith(
        req.user,
        enrollUserDto,
      );
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/');
    });
    it("'should update a new user and redirect to the account page if the user has only the role admin", async () => {
      // setup
      req.user.roles = ['admin'];
      userService.enrollUser.mockImplementation(() => Promise.resolve(true));
      // action
      await accountController.enrollUser(enrollUserDto, req, res);
      // assertion
      expect(userService.enrollUser).toHaveBeenCalledTimes(1);
      expect(userService.enrollUser).toHaveBeenCalledWith(
        req.user,
        enrollUserDto,
      );
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/');
    });
    it("should fall back in the catch statement if user's updated password and password confirmation do not respect the dto", async () => {
      // setup
      userService.enrollUser.mockImplementation(() =>
        Promise.reject(new Error('wrong, buddy')),
      );
      // action
      await accountController.enrollUser(
        {
          password: 'mypasswordoesnotrespectthedto',
          passwordConfirmation: 'mypasswordoesnotrespectthedto',
        },
        req,
        res,
      );
      // assertion
      expect(userService.enrollUser).toHaveBeenCalledTimes(1);
      expect(req.flash).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account/enrollment');
    });
  });

  describe('delete', () => {
    it('should call deleteUser of the user service with the provided id', async () => {
      // set up
      const id = 'd3d3f8a1-26ea-4a8b-9ed3-336d3777b529';
      // action
      await accountController.deleteUser(id, req, res);
      // assertion
      expect(userService.deleteUserById).toHaveBeenCalledTimes(1);
      expect(userService.deleteUserById).toHaveBeenCalledWith(id);
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account');
    });

    it('should not call deleteUser of the user service but redirect the user to the /account page', async () => {
      // set up
      const id = '05e4fadf-fda6-4ad8-ae75-b7f315843827';
      // action
      await accountController.deleteUser(id, req, res);
      // assertion
      expect(res.redirect).toHaveBeenCalledWith('/foo/bar/account');
      expect(userService.deleteUserById).toHaveBeenCalledTimes(0);
    });

    it('should not redirect the user but set the res status to 500 for the error handler', async () => {
      // set up
      userService.deleteUserById = jest.fn(() => {
        throw Error;
      });
      const id = '2d1280f1-1611-42fa-968a-47e450e0aeba';
      // action
      await accountController.deleteUser(id, req, res);
      // assertion
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.redirect).toHaveBeenCalledTimes(0);
      expect(userService.deleteUserById).toHaveBeenCalledTimes(1);
    });
  });
});
