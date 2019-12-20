import {
  Controller,
  Get,
  Render,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StatsService } from '../service/stats.service';
import { SummaryService } from '../service/sumary.service';
import { EventUIListInputDTO } from '../dto/event-ui-list-input.dto';
import { EventUIListOutputDTO } from '../dto/event-ui-list-output.dto';
import { MetricUIListInputDTO } from '../dto/metric-ui-list-input.dto';
import { MetricUIListOutputDTO } from '../dto/metric-ui-list-output.dto';
import { StatsServiceParams } from '../interfaces/stats-service-params.interface';
import { Roles } from '@fc/shared/authentication/decorator/roles.decorator';
import { UserRole } from '@fc/shared/user/roles.enum';
import { ISummary } from '../interfaces/summary.interface';

@Controller()
export class StatsUIController {
  constructor(
    private readonly statsService: StatsService,
    private readonly summaryService: SummaryService,
  ) {}

  @Get('summary')
  @Roles(UserRole.OPERATOR)
  @Render('summary/index')
  getIndex() {
    const summary: ISummary[] = this.summaryService.getSummary();

    return { summary };
  }

  @Get('events')
  @Roles(UserRole.OPERATOR)
  @Render('events/index')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getEvents(
    @Query() params: EventUIListInputDTO,
  ): Promise<EventUIListOutputDTO> {
    const { start, stop } = params;

    if (start && stop) {
      return this.statsService.getEvents(params as StatsServiceParams);
    }

    return { params };
  }

  @Get('metrics')
  @Roles(UserRole.OPERATOR)
  @Render('metrics/index')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getMetrics(
    @Query() params: MetricUIListInputDTO,
  ): Promise<MetricUIListOutputDTO> {
    const { start, stop } = params;

    if (start && stop) {
      return this.statsService.getMetrics(params as StatsServiceParams);
    }

    return { params };
  }
}
