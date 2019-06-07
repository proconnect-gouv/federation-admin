import { Controller, Get, Post, Render, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guard/local.guard';

@Controller()
export class AuthenticationController {
  @Get('login')
  @Render('login')
  // tslint:disable-next-line:no-empty
  public loginView() {}

  @Post('login')
  @UseGuards(new LocalAuthGuard())
  public async login(@Res() res) {
    return res.redirect('/');
  }
}
