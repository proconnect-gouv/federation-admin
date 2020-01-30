import { Controller, Get, Req, Res } from '@nestjs/common';
import { LoggerService } from '@fc/shared/logger/logger.service';

@Controller()
export class AppController {
  public constructor(private readonly logger: LoggerService) {}

  @Get()
  public index(@Req() req, @Res() res) {
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
