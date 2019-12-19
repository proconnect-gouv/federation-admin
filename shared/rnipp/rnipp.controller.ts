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

import { Roles } from '@fc/shared/authentication/decorator/roles.decorator';
import { UserRole } from '@fc/shared/user/roles.enum';
import { RnippService } from './rnipp.service';
import { ErrorControllerInterface } from './interface/error-controller.interface';
import { Person } from './interface/person.interface';
import { PersonRequestedDTO } from './dto/person-requested-input.dto';
import { PersonFoundDTO } from './dto/person-found-output.dto';
import { IResponseFromRnipp } from './interface/response-from-rnipp.interface';
import { TraceService } from '@fc/shared/logger/trace.service';
import { LogActions } from '@fc/shared/logger/enum/log-actions.enum';
import { RnippCallStates } from '@fc/shared/logger/enum/rnipp-call-states.enum';

@Controller()
export class RnippController {
  prototype: any;
  public constructor(
    private readonly rnippService: RnippService,
    private readonly logger: TraceService,
  ) {}

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
    @Body() personRequested: PersonRequestedDTO,
    @Req() req,
  ): Promise<PersonFoundDTO | ErrorControllerInterface> {
    const csrfToken = req.csrfToken();

    this.logger.supportRnippCall({
      action: LogActions.SUPPORT_RNIPP_CALL,
      state: RnippCallStates.INITIATED,
      user: req.user.username,
      reason: `ticket support : ${personRequested.supportId}`,
    });
    try {
      const response: IResponseFromRnipp = await this.rnippService.getJsonFromRnippApi(
        req,
        personRequested as Person,
      );

      this.logger.supportRnippCall({
        action: LogActions.SUPPORT_RNIPP_CALL,
        state: RnippCallStates.SUCCESS,
        code: response.rnippCode,
        user: req.user.username,
        reason: `ticket support : ${personRequested.supportId}`,
        identityHash: response.identityHash,
      });

      return {
        person: {
          requested: personRequested,
          found: response.personFoundByRnipp,
        },
        rnippResponse: {
          code: response.rnippCode,
          raw: response.rawResponse,
        },
        csrfToken,
      };
    } catch (error) {
      this.logger.supportRnippCall({
        action: LogActions.SUPPORT_RNIPP_CALL,
        state: RnippCallStates.ERRORED,
        code: error.rnippCode,
        user: req.user.username,
        reason: `ticket support : ${personRequested.supportId}`,
        identityHash: error.identityHash,
      });
      return this.handleError(error, personRequested, csrfToken);
    }
  }

  private async handleError(
    error: any,
    personRequested: PersonRequestedDTO,
    csrfToken: string,
  ): Promise<ErrorControllerInterface> {
    if (error.errors) {
      return {
        person: {
          requested: personRequested,
        },
        message: error.errors,
        csrfToken,
      };
    } else {
      return {
        person: {
          requested: personRequested,
        },
        rawResponse: error.rawResponse,
        rnippCode: error.rnippCode || '',
        statusCode: error.statusCode || 500,
        message: error.message,
        csrfToken,
      };
    }
  }
}
