import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class StatsController {
  constructor() {}

  @Get('stats')
  @Render('stats/list')
  async list() {
    const stats = [
      { name: 'fooName', value: 'fooValue' },
      { name: 'barName', value: 'barValue' },
    ];
    return {
      stats,
    };
  }
}
