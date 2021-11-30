import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsApiGuard } from './guard/stats-api.guard';
import { StatsApiService } from './service/stats-api.service';
import { TotalUsers } from './interface/total-users.interface';

@Controller('stats-api')
@UseGuards(StatsApiGuard)
export class StatsApiController {
  constructor(private readonly statsApiService: StatsApiService) {}

  @Get('identity')
  async getTotalUsers(): Promise<TotalUsers> {
    const data = await this.statsApiService.getUserCount();
    return data;
  }
}
