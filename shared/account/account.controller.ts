import { UserRole } from '@fc/shared/user/roles.enum';
import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Render,
  Req,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from '@fc/shared/user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EnrollUserDto } from './dto/enroll-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@fc/shared/user/user.entity';
import { Roles } from '@fc/shared/authentication/decorator/roles.decorator';
import { FormErrorsInterceptor } from '@fc/shared/form/interceptor/form-errors.interceptor';
import { UserCreation } from '@fc/shared/user/value-object/user-creation';
import { AccountService } from './account.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { UserPasswordUpdate } from '@fc/shared/user/value-object/user-password-update';
import { TotpService } from '@fc/shared/authentication/totp/totp.service';

@Controller('account')
export class AccountController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly totpService: TotpService,
  ) {}

  @Get('/create')
  @Roles(UserRole.ADMIN)
  @Render('account/creation')
  showCreationForm(@Req() req) {
    const csrfToken = req.csrfToken();
    const tmpPassword = this.userService.generateTmpPass();
    return { csrfToken, tmpPassword };
  }

  @Post('create')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(new FormErrorsInterceptor(`/account/create`))
  @UsePipes(ValidationPipe)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req,
    @Res() res,
  ) {
    req.body.roles = req.body.roles.map(role => `inactive_${role}`);
    req.body.roles.push('new_account');
    req.body.secret = this.totpService.generateTotpSecret();
    try {
      await this.userService.createUser(createUserDto as UserCreation);
    } catch (error) {
      req.flash('globalError', { code: '23505' });
      return res.redirect(`${res.locals.APP_ROOT}/account/create`);
    }
    req.flash(
      'success',
      `L'utilisateur ${createUserDto.username} a été créé avec succès !`,
    );
    return res.redirect(`${res.locals.APP_ROOT}/account`);
  }

  @Get('enrollment')
  @Roles(UserRole.NEWUSER)
  @Render('account/enrollment')
  public async firstLogin(@Req() req, @Res() res) {
    const {
      user,
      issuer,
      secret,
      QRCode,
      step,
      algorithm,
    } = await this.totpService.generateTotpQRCode(req.user);
    const csrfToken = req.csrfToken();

    return {
      csrfToken,
      user,
      issuer,
      secret,
      QRCode,
      step,
      algorithm,
    };
  }

  @Patch('enrollment')
  @Roles(UserRole.NEWUSER)
  @UseInterceptors(new FormErrorsInterceptor(`/account/enrollment`))
  @UsePipes(ValidationPipe)
  async enrollUser(
    @Body() enrollUserDto: EnrollUserDto,
    @Req() req,
    @Res() res,
  ) {
    try {
      await this.userService.enrollUser(
        req.user,
        enrollUserDto as UserPasswordUpdate,
      );
    } catch (error) {
      req.flash('globalError', `L\'utilisateur n'a pas pu être mis à jour`);
      return res.redirect(`${res.locals.APP_ROOT}/account/enrollment`);
    }
    req.flash('success', `Le mot de passe a bien été mis à jour !`);

    return res.redirect(`${res.locals.APP_ROOT}/`);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(new FormErrorsInterceptor('/account'))
  async deleteUser(
    @Param('id', new ParseUUIDPipe()) id,
    @Req() req,
    @Res() res,
  ): Promise<any> {
    if (req.user.id === id) {
      req.flash(
        'globalError',
        'Merci de ne pas essayer de vous supprimez vous même ;)',
      );
      return res.redirect(`${res.locals.APP_ROOT}/account`);
    }

    try {
      await this.userService.deleteUserById(id);
      req.flash(
        'success',
        `Le compte ${req.body.username} a été supprimé avec succès !`,
      );
      return res.redirect(`${res.locals.APP_ROOT}/account`);
    } catch (error) {
      req.flash('globalError', error);
      return res.status(500);
    }
  }

  @Get()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SECURITY)
  @Render('account/list')
  async list(
    @Req() req,
    @Query('page') pageQuery: string = '0',
    @Query('limit') limitQuery: string = '10',
  ) {
    const page = parseInt(pageQuery, 10);
    const limit = parseInt(limitQuery, 10);

    const csrfToken = req.csrfToken();
    const users: Pagination<User> = await this.accountService.paginate({
      page,
      limit,
      route: '/account',
    });

    return {
      users: users.items,
      totalUsers: users.totalItems,
      csrfToken,
      next: users.next,
      previous: users.previous,
      pageCount: users.pageCount,
      page,
      limit,
    };
  }
}
