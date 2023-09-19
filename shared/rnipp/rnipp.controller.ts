import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

import { Roles } from '@fc/shared/authentication/decorator/roles.decorator';
import { IIdentity } from '@fc/shared/citizen/interfaces/identity.interface';
import { LoggerService } from '@fc/shared/logger/logger.service';
import { RnippActions, RnippStates } from '@fc/shared/rnipp/rnipp-actions.enum';
import { IRnippTrack } from '@fc/shared/rnipp/rnipp-track.interface';
import { UserRole } from '@fc/shared/user/roles.enum';
import * as beautify from 'xml-beautifier';
import { PersonFoundDTO } from './dto/person-found-output.dto';
import { RectificationRequestDTO } from './dto/rectification-request.dto';
import { ErrorControllerInterface } from './interface/error-controller.interface';
import { RnippService } from './rnipp.service';
import { IResponseFromRnipp } from './interface';
import { RNIPP_IDENTITY_RESPONSE_CODES } from './rnipp-constants';

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

    const requestedIdentities = await this.rnippService.buildIdentitiestoRectify(
      rectificationRequest,
    );

    let responseRNIPPArray: IResponseFromRnipp[];
    try {
      const responseRNIPPromises = requestedIdentities.map(
        async requestedIdentity => {
          return this.rnippService.requestIdentityRectification(
            requestedIdentity,
          );
        },
      );

      responseRNIPPArray = await Promise.all(responseRNIPPromises);
      const searchResults = responseRNIPPArray.map(
        ({
          rectifiedIdentity,
          rnippDead,
          rnippCode,
          rawResponse,
          identityHash,
        }) => {
          this.track({
            action: RnippActions.SUPPORT_RNIPP_CALL,
            state:
              Number(rnippCode) ===
              (RNIPP_IDENTITY_RESPONSE_CODES.found ||
                RNIPP_IDENTITY_RESPONSE_CODES.rectified)
                ? RnippStates.SUCCESS
                : RnippStates.ERRORED,
            code: rnippCode,
            user: req.user.username,
            reason: `ticket support : ${rectificationRequest.supportId}`,
            identityHash,
          });

          return {
            person: { rectifiedIdentity, dead: rnippDead },
            rnippResponse: { code: rnippCode, raw: beautify(rawResponse) },
          };
        },
      );

      return {
        appName,
        rectifyResponseCodes: RNIPP_IDENTITY_RESPONSE_CODES,
        searchResults,
        requestedIdentity: rectificationRequest,
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
        appName,
        error,
        rectificationRequest.supportId,
        requestedIdentities,
        responseRNIPPArray,
        csrfToken,
      );
    }
  }

  private async handleError(
    appName,
    error: any,
    supportId: string,
    requestedIdentities: IIdentity[],
    responseRNIPPArray: IResponseFromRnipp[],
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

    const persons = requestedIdentities.map((rectifiedIdentity, index) => {
      return {
        rectifiedIdentity,
        dead: !!(responseRNIPPArray && responseRNIPPArray[index].rnippDead),
      };
    });

    return {
      appName,
      persons,
      supportId,
      csrfToken,
      ...data,
    };
  }
}
