import {
  Controller,
  Get,
  Render,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsInputDTO } from './dto/stats-input.dto';
import { StatsOutputDTO } from './dto/stats-output.dto';

@Controller()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('stats')
  @Render('stats/list')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async list(@Query() query: StatsInputDTO): Promise<StatsOutputDTO> {
    if (query.start && query.stop) {
      const stats = await this.statsService.getEvents(query);
      return { stats };
    }

    return {};
  }
}
