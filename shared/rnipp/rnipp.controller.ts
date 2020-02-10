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

    this.track({
      action: RnippActions.SUPPORT_RNIPP_CALL,
      state: RnippStates.INITIATED,
      user: req.user.username,
      reason: `ticket support : ${rectificationRequest.supportId}`,
    });

    const requestedIdentity = rectificationRequest.toIdentity();

    try {
      const response: IResponseFromRnipp = await this.rnippService.requestIdentityRectification(
        requestedIdentity,
      );

      this.track({
        action: RnippActions.SUPPORT_RNIPP_CALL,
        state: RnippStates.SUCCESS,
        code: response.rnippCode,
        user: req.user.username,
        reason: `ticket support : ${rectificationRequest.supportId}`,
        identityHash: response.identityHash,
      });

      return {
        person: {
          requestedIdentity,
          rectifiedIdentity: response.rectifiedIdentity,
        },
        rnippResponse: {
          code: response.rnippCode,
          raw: beautify(response.rawResponse),
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
      return this.handleError(
        error,
        rectificationRequest.supportId,
        requestedIdentity,
        csrfToken,
      );
    }
  }

  private async handleError(
    error: any,
    supportId: string,
    requestedIdentity: IIdentity,
    csrfToken: string,
  ): Promise<ErrorControllerInterface> {
    if (error.errors) {
      return {
        person: {
          requestedIdentity,
        },
        supportId,
        message: error.errors,
        csrfToken,
      };
    } else {
      return {
        person: {
          requestedIdentity,
        },
        supportId,
        rawResponse: error.rawResponse,
        rnippCode: error.rnippCode || '',
        statusCode: error.statusCode || 500,
        message: error.message,
        csrfToken,
      };
    }
  }
}
