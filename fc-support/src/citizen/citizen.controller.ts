import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '@fc/shared/authentication/decorator/roles.decorator';
import { UserRole } from '@fc/shared/user/roles.enum';
import { CitizenService } from './citizen.service';
import { IIdentity } from '@fc/shared/citizen/interfaces/identity.interface';
import { IPivotIdentity } from '@fc/shared/citizen/interfaces/pivot-identity.interface';
import { PatchCitizenActiveDTO } from './dto/patch-citizen-active.dto';
import { CitizenAccountDTO } from './dto/citizen-account.dto';

@Controller('citizen')
export class CitizenController {
  constructor(private readonly citizenService: CitizenService) {}

  @Post()
  @Roles(UserRole.OPERATOR)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getCitizenStatus(@Body() citizenIdentity: IIdentity) {
    const citizenHash: string = this.citizenService.getPivotIdentityHash(
      citizenIdentity as IPivotIdentity,
    );
    const citizenAccount = await this.citizenService.findByHash(citizenHash);

    if (!citizenAccount) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return {
      active: citizenAccount.active,
      lastConnection: this.getLastConnection(citizenAccount),
    };
  }

  private getLastConnection(citizen: CitizenAccountDTO) {
    if (!citizen.active && citizen.lastConnection) {
      return new Date(citizen.lastConnection).toISOString();
    }

    if (citizen.updatedAt) {
      return new Date(citizen.updatedAt).toISOString();
    }

    return null;
  }
}
