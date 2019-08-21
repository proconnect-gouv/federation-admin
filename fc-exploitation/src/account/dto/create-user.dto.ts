import { UserRole } from '@fc/shared/user/roles.enum';
import {
  IsNotEmpty,
  IsEmail,
  ArrayNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { IsCompliant } from '../validator/is-compliant.validator';

export class CreateUserDto {
  @IsNotEmpty({ message: "Le nom d'utilisateur doit être renseigné" })
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: `Veuillez mettre un nom d'utilisateur ( Majuscule, minuscule, nombres et trait d'union )`,
  })
  readonly username: string;

  @IsNotEmpty({ message: "L'email doit être renseigné" })
  @IsEmail({}, { message: "L'email renseigné n'est pas valide" })
  readonly email: string;

  @IsNotEmpty({ message: 'Le mot de passe doit être renseigné' })
  @IsCompliant()
  readonly password: string;

  @ArrayNotEmpty({ message: 'Veuillez renseigner au moins un rôle' })
  readonly roles: UserRole[];

  @IsString()
  readonly secret: string;

  constructor(
    username: string,
    email: string,
    password: string,
    roles: UserRole[],
    secret: string,
  ) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.roles = roles;
    this.secret = secret;
  }
}
