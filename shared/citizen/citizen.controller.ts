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
import { CitizenIdentityDTO } from './dto/citizen-identity.dto';
import { PatchCitizenActiveDTO } from './dto/patch-citizen-active.dto';
import { CitizenAccountDTO } from './dto/citizen-account.dto';

@Controller('citizen')
export class CitizenController {
  constructor(private readonly citizenService: CitizenService) {}

  @Post()
  @Roles(UserRole.OPERATOR)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getCitizenStatus(@Body() citizenIdentity: CitizenIdentityDTO) {
    const citizenHash: string = this.citizenService.getCitizenHash(
      citizenIdentity,
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

  @Patch()
  @Roles(UserRole.OPERATOR)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async patchCitizenStatus(
    @Body() citizenIdentity: PatchCitizenActiveDTO,
    @Req() req,
    @Res() res,
  ) {
    // Security check
    if (!req.totp || req.totp !== 'valid') {
      return res.status(401).send('Code TOTP invalide');
    }

    // Seek citizen informations
    const citizenHash: string = this.citizenService.getCitizenHash(
      citizenIdentity as CitizenIdentityDTO,
    );
    const citizenAccount = await this.citizenService.findByHash(citizenHash);

    // If found
    if (citizenAccount) {
      this.citizenService.setActive(
        citizenHash,
        citizenIdentity.active,
        citizenIdentity.supportId,
        req.user,
      );
      return res.json({
        active: citizenIdentity.active,
        lastConnection: this.getLastConnection(citizenAccount),
      });
    }

    // Else
    this.citizenService.createBlockedCitizen(
      citizenIdentity as CitizenIdentityDTO,
      req.user,
    );
    return res.json({ active: false, lastConnection: null });
  }

  private getLastConnection(citizen: CitizenAccountDTO) {
    if (citizen.updatedAt) {
      return new Date(citizen.updatedAt).toISOString();
    }

    return null;
  }
}
