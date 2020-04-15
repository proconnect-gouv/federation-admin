import * as bcrypt from 'bcrypt';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, UpdateResult } from 'typeorm';
import { InjectConfig, ConfigService } from 'nestjs-config';
import { v4 as uuid } from 'uuid';

import { User } from './user.sql.entity';
import { IUserPasswordUpdateDTO } from './interface/user-password-update-dto.interface';
import { IEnrollUserDto } from './interface/enroll-user-dto.interface';
import { IUserService } from './interface/user-service.interface';
import { ICreateUserDTO } from './interface/create-user-dto.interface';
import { IsPasswordCompliant } from '../account/validator/is-compliant.validator';
import { MailerService } from '../mailer/mailer.service';
import { IMailerParams } from '../mailer/interfaces';
import { Email } from '../mailer/mailjet';
import { UserRole } from '@fc/shared/user/roles.enum';
import { LoggerService } from '@fc/shared/logger/logger.service';

@Injectable()
export class UserService implements IUserService {
  private readonly SALT_ROUNDS = 10;
  private readonly userTokenExpiresIn;

  constructor(
    @Inject('generatePassword') private readonly generatePassword,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggerService,
    @InjectConfig() private readonly config: ConfigService,
    private readonly transporterService: MailerService,
  ) {
    this.userTokenExpiresIn =
      this.config.get('app').userTokenExpiresIn * 60 * 1000;
  }

  callGeneratePassword() {
    return this.generatePassword.generate({
      length: 12,
      numbers: true,
      symbols: true,
      uppercase: true,
      excludeSimilarCharacters: true,
      strict: true,
    });
  }

  generateTmpPass() {
    const validator = new IsPasswordCompliant();
    let temporaryPassword = '';
    let i = 0;
    while (i < 10) {
      temporaryPassword = this.callGeneratePassword();
      if (validator.validate(temporaryPassword)) {
        return temporaryPassword;
      }
      i += 1;
    }
    return 'The password could not be generated, please try again';
  }

  passwordDoesNotContainUsername(password: string, username: string) {
    const lowerCasePassword = password.toLowerCase();
    return lowerCasePassword.includes(username) ? false : true;
  }

  async enrollUser(
    user,
    enrollmentPassword: IEnrollUserDto,
  ): Promise<UpdateResult> {
    const roles = user.roles
      .filter(role => role !== 'new_account')
      .map(role => role.replace('inactive_', ''));
    try {
      return await this.updatePassword(user, enrollmentPassword.password, {
        roles,
      });
    } catch (err) {
      throw new Error('password could not be updated');
    }
  }

  async updateUserAccount(
    user,
    data: IUserPasswordUpdateDTO,
  ): Promise<UpdateResult> {
    const isValidPassword = await this.compareHash(
      data.currentPassword,
      user.passwordHash,
    );
    if (isValidPassword) {
      try {
        return await this.updatePassword(user, data.password, {});
      } catch (err) {
        throw new Error('password could not be updated');
      }
    } else {
      throw new Error(
        'password could not be updated because old password is invalid',
      );
    }
  }

  async findByUsername(username: string): Promise<User> {
    let user;
    try {
      user = await this.userRepository.findOne({ username });
      return user;
    } catch (e) {
      this.logger.error(e);
      throw new Error('The user could not be found due to a database error');
    }
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createUser(user: ICreateUserDTO): Promise<User> {
    const { appFqdn } = this.config.get('app');
    const { username, email, roles, secret } = user;
    const token: string = uuid();

    let passwordHash;
    try {
      passwordHash = await bcrypt.hash(user.password, this.SALT_ROUNDS);
    } catch (err) {
      throw new Error('password hash could not be generated');
    }

    try {
      this.sendNewAccountEmail(
        { username, email },
        {
          templateName: 'enrollment',
          variables: {
            appFqdn,
            token,
          },
        },
      );
    } catch (error) {
      throw new Error(
        `Sending email failed. Abandonment of user creation : ${error}`,
      );
    }
    try {
      const {
        tokenCreatedAt,
        tokenExpiresAt,
      } = this.setAuthenticationTokenExpirationDate();
      return this.userRepository.save({
        passwordHash,
        username,
        email,
        roles,
        secret,
        token,
        tokenCreatedAt,
        tokenExpiresAt,
      });
    } catch (err) {
      throw new Error('The user could not be saved');
    }
  }

  async blockUser(username): Promise<User> {
    let blockedUser;

    try {
      blockedUser = await this.userRepository.update(
        { username },
        { roles: [UserRole.BLOCKED_USER] },
      );
    } catch (e) {
      this.logger.error(e);
      throw new Error('The user could not be blocked due to a database error');
    }

    return blockedUser;
  }

  async deleteUserById(id: string): Promise<DeleteResult> {
    return this.userRepository.delete({ id });
  }

  async updatePassword(
    { username, id },
    password,
    userData,
  ): Promise<UpdateResult> {
    const newPasswordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
    let userEntity;
    try {
      userEntity = await this.findByUsername(username);
      userEntity.passwordHash = newPasswordHash;
      Object.assign(userEntity, userData);
      await this.userRepository.update(id, userEntity);
    } catch (err) {
      throw new Error('password could not be updated');
    }
    return userEntity;
  }

  sendNewAccountEmail({ username, email }, options: IMailerParams) {
    return this.transporterService.send(
      this.createRecipients(username, email),
      options,
    );
  }

  createRecipients(username: string, email: string): Email.SendParamsMessage {
    const { appName } = this.config.get('app');
    const { smtpSenderName, smtpSenderEmail } = this.config.get('transporter');

    return {
      From: {
        Email: smtpSenderEmail,
        Name: smtpSenderName,
      },
      To: [
        {
          Email: email,
          Name: username,
        },
      ],
      Subject: `Demande de création d'un compte utilisateur sur ${appName}`,
    };
  }

  private setAuthenticationTokenExpirationDate() {
    const now = new Date();
    const tokenCreatedAt = now;
    const tokenExpiresAt = new Date(now.getTime() + this.userTokenExpiresIn);

    return { tokenCreatedAt, tokenExpiresAt };
  }
}
