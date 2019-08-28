import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { StatsService } from '../service/stats.service';
import { StatsAPITotalActionInputDTO } from '../dto/stats-api-total-action-input.dto';
import { StatsAPITotalActionOutputDTO } from '../dto/stats-api-total-action-output.dto';
import { StatsAPITotalFIInputDTO } from '../dto/stats-api-total-fi-input.dto';
import { StatsAPITotalFIOutputDTO } from '../dto/stats-api-total-fi-output.dto';
import { StatsServiceParams } from '../interfaces/stats-service-params.interface';
import { TotalByFIWeek } from '../interfaces/total-by-fi-response.interface';
import { DummyApiGuard } from '@fc/shared/authentication/guard/dummy-api.guard';

@Controller('api/v1')
@UseGuards(DummyApiGuard)
export class StatsAPIController {
  constructor(private readonly statsService: StatsService) {}

  @Get('/total')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getTotalByActionAndRange(
    @Query() query: StatsAPITotalActionInputDTO,
  ): Promise<StatsAPITotalActionOutputDTO> {
    const count = await this.statsService.getTotalByActionAndRange(
      query as StatsServiceParams,
    );

    return { ...query, count } as StatsAPITotalActionOutputDTO;
  }

  @Get('/totalByFi')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getTotalByFi(
    @Query() query: StatsAPITotalFIInputDTO,
  ): Promise<StatsAPITotalFIOutputDTO> {
    const weeks: TotalByFIWeek[] = await this.statsService.getTotalForActionsAndFiAndRangeByWeek(
      query as StatsServiceParams,
    );
    return { ...query, weeks } as StatsAPITotalFIOutputDTO;
  }
}
