import { Controller, Get, Req, Res } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  public index(@Req() req, @Res() res) {
    if (req.user.roles.includes('new_account')) {
      return res.redirect(`${res.locals.APP_ROOT}/account/enrollment`);
    } else if (req.user.roles.includes('operator')) {
      return res.redirect(`${res.locals.APP_ROOT}/rnipp`);
    } else if (req.user.roles.includes('admin')) {
      return res.redirect(`${res.locals.APP_ROOT}/account`);
    }
  }
}
