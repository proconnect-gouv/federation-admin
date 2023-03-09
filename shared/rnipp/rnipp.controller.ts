import {
  Controller,
  Get,
  Post,
  Render,
  Body,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

import * as beautify from 'xml-beautifier';
import { Roles } from '@fc/shared/authentication/decorator/roles.decorator';
import { UserRole } from '@fc/shared/user/roles.enum';
import { RnippService } from './rnipp.service';
import { ErrorControllerInterface } from './interface/error-controller.interface';
import { IIdentity } from '@fc/shared/citizen/interfaces/identity.interface';
import { RectificationRequestDTO } from './dto/rectification-request.dto';
import { PersonFoundDTO } from './dto/person-found-output.dto';
import { IResponseFromRnipp } from './interface/response-from-rnipp.interface';
import { LoggerService } from '@fc/shared/logger/logger.service';
import { RnippActions, RnippStates } from '@fc/shared/rnipp/rnipp-actions.enum';
import { IRnippTrack } from '@fc/shared/rnipp/rnipp-track.interface';

@Controller()
export class RnippController {
  prototype: any;
  public constructor(
    private readonly rnippService: RnippService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  private track(log: IRnippTrack) {
    this.logger.businessEvent(log);
  }

  @Get('rnipp')
  @Roles(UserRole.OPERATOR)
  @Render('rnipp')
  // tslint:disable-next-line: no-empty
  public async rnippView(@Req() req) {
    const csrfToken = req.csrfToken();
    return { csrfToken };
  }

  @Post('research')
  @Roles(UserRole.OPERATOR)
  @Render('rnipp')
  @UsePipes(new ValidationPipe({ transform: true }))
  public async researchRnipp(
    @Body() rectificationRequest: RectificationRequestDTO,
    @Req() req,
  ): Promise<PersonFoundDTO | ErrorControllerInterface> {
    const csrfToken = req.csrfToken();
    const { appName } = this.config.get('app');
    this.track({
      action: RnippActions.SUPPORT_RNIPP_CALL,
      state: RnippStates.INITIATED,
      user: req.user.username,
      reason: `ticket support : ${rectificationRequest.supportId}`,
    });

    const requestedIdentity = rectificationRequest.toIdentity();
    let responseRNIPP: IResponseFromRnipp;
    try {
      responseRNIPP = await this.rnippService.requestIdentityRectification(
        requestedIdentity,
      );

      this.track({
        action: RnippActions.SUPPORT_RNIPP_CALL,
        state: RnippStates.SUCCESS,
        code: responseRNIPP.rnippCode,
        user: req.user.username,
        reason: `ticket support : ${rectificationRequest.supportId}`,
        identityHash: responseRNIPP.identityHash,
      });

      return {
        appName,
        person: {
          requestedIdentity,
          rectifiedIdentity: responseRNIPP.rectifiedIdentity,
          dead: responseRNIPP.rnippDead,
        },
        rnippResponse: {
          code: responseRNIPP.rnippCode,
          raw: beautify(responseRNIPP.rawResponse),
        },
        supportId: rectificationRequest.supportId,
        csrfToken,
      };
    } catch (error) {
      this.track({
        action: RnippActions.SUPPORT_RNIPP_CALL,
        state: RnippStates.ERRORED,
        code: error.rnippCode,
        user: req.user.username,
        reason: `ticket support : ${rectificationRequest.supportId}`,
        identityHash: error.identityHash,
      });
      const { rnippDead = false } = responseRNIPP || {};
      return this.handleError(
        appName,
        error,
        rectificationRequest.supportId,
        requestedIdentity,
        rnippDead,
        csrfToken,
      );
    }
  }

  private async handleError(
    appName,
    error: any,
    supportId: string,
    requestedIdentity: IIdentity,
    dead: boolean,
    csrfToken: string,
  ): Promise<ErrorControllerInterface> {
    const {
      errors,
      rawResponse,
      rnippCode = '',
      statusCode = 500,
      message,
    } = error;

    const data = errors
      ? { message: errors }
      : {
          rawResponse: rawResponse ? beautify(rawResponse) : rawResponse,
          rnippCode,
          statusCode,
          message,
        };

    return {
      appName,
      person: {
        requestedIdentity,
        dead,
      },
      supportId,
      csrfToken,
      ...data,
    };
  }
}
