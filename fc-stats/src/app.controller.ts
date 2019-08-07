import { Controller, Get, Res } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  async index(@Res() res) {
    return res.redirect(`${res.locals.APP_ROOT}/stats`);
  }
}
