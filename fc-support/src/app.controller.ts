import { Controller, Get, Req, Res } from '@nestjs/common';
import { TraceService } from '@fc/shared/logger/trace.service';
import { LogActions } from '@fc/shared/logger/enum/log-actions.enum';
import { LogStates } from '@fc/shared/logger/enum/log-states.enum';

@Controller()
export class AppController {
  public constructor(private readonly logger: TraceService) {}

  @Get()
  public index(@Req() req, @Res() res) {
    this.logger.supportRnippCall({
      action: LogActions.CONNEXION,
      state: LogStates.CONNECTED,
      user: req.user.username,
    });
    if (req.user.roles.includes('new_account')) {
      return res.redirect(`${res.locals.APP_ROOT}/account/enrollment`);
    } else if (req.user.roles.includes('operator')) {
      return res.redirect(`${res.locals.APP_ROOT}/rnipp`);
    } else if (
      req.user.roles.includes('admin') ||
      req.user.roles.includes('security')
    ) {
      return res.redirect(`${res.locals.APP_ROOT}/account`);
    }
  }
}
