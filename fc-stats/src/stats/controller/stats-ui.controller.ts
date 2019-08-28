import {
  Controller,
  Get,
  Render,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StatsService } from '../service/stats.service';
import { StatsUIListInputDTO } from '../dto/stats-ui-list-input.dto';
import { StatsUIListOutputDTO } from '../dto/stats-ui-list-output.dto';
import { StatsServiceParams } from '../interfaces/stats-service-params.interface';
import { Roles } from '@fc/shared/authentication/decorator/roles.decorator';
import { UserRole } from '@fc/shared/user/roles.enum';

@Controller()
export class StatsUIController {
  constructor(private readonly statsService: StatsService) {}

  @Get('stats')
  @Roles(UserRole.OPERATOR)
  @Render('stats/list')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async list(
    @Query() query: StatsUIListInputDTO,
  ): Promise<StatsUIListOutputDTO> {
    if (query.start && query.stop) {
      const { stats, meta } = await this.statsService.getEvents(
        query as StatsServiceParams,
      );
      return { stats, meta } as StatsUIListOutputDTO;
    }

    return {};
  }
}
