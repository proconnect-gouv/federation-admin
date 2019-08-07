import {
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guard/local.guard';

@Controller()
export class AuthenticationController {
  @Get('login')
  @Render('login')
  // tslint:disable-next-line:no-empty
  public loginView() {}

  @Post('login')
  @UseGuards(new LocalAuthGuard())
  public login(@Res() res) {
    return res.redirect(`${res.locals.APP_ROOT}/`);
  }

  @Get('logout')
  public logout(@Req() req, @Res() res) {
    req.logout();
    return res.redirect(`${res.locals.APP_ROOT}/`);
  }
}
