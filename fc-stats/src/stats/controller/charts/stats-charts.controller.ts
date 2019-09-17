import {
  Controller,
  Get,
  Render,
  Query,
  ValidationPipe,
  UsePipes,
  Res,
  Req,
  Post,
} from '@nestjs/common';
import { UserRole } from '@fc/shared/user/roles.enum';
import { Roles } from '@fc/shared/authentication/decorator/roles.decorator';
import { StatsService } from '../../service/stats.service';
import { StatsUIListInputDTO } from '../../dto/stats-ui-list-input.dto';
import { StatsServiceParams } from '../../interfaces/stats-service-params.interface';
import { ChartsService } from '../../service/charts/charts.service';
import * as Moment from 'moment';

@Controller()
export class StatsChartsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly chartsService: ChartsService,
  ) {}

  @Get('stats/charts-choice')
  @Roles(UserRole.OPERATOR)
  @Render('stats/charts-choice')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async choice(): Promise<any> {
    /**
     * Find a better place for this
     */
    const granularity = [
      { key: 'day', value: 'Jours' },
      { key: 'week', value: 'Semaines' },
      { key: 'Month', value: 'Mois' },
      { key: 'Year', value: 'Années' },
    ];

    const { fsList, fiList } = await this.statsService.getDataWithoutRange();

    return {
      granularity,
      fsList,
      fiList,
    };
  }

  @Get('stats/charts-show')
  @Roles(UserRole.OPERATOR)
  @Render('stats/charts-show')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async show(@Query() query: StatsUIListInputDTO, @Res() res): Promise<any> {
    let data;
    const start = Moment(query.start).format('DD-MM-YYYY');
    const stop = Moment(query.stop).format('DD-MM-YYYY');
    const fi = query.filters[0].value;

    const titleText = `${this.chartsService.setChartTitle(
      query.chartList,
    )} ${fi.toUpperCase()} - Periode du ${start} au ${stop}`;

    if (start && stop) {
      // TODO format query to get more easily all the param to adapt most of the query
      data = await this.statsService.getTotalForActionsAndFiAndRangeByWeekChartTest(
        query,
      );
      const granularity = query.filters[1].value;

      const { labelsArray, dataArray } = this.chartsService.transformEsData(
        data,
        granularity,
      );

      return {
        labelsArray,
        dataArray,
        start,
        stop,
        fi,
        titleText,
      };
    }
    return {};
  }
}
