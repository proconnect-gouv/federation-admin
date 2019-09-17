import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { StatsService } from './service/stats.service';
import { CsvService } from './service/csv.service';
import { StatsQueries } from './stats.queries';
import { StatsUIController } from './controller/stats-ui.controller';
import { StatsAPIController } from './controller/stats-api.controller';
import { StatsCSVController } from './controller/stats-csv.controller';
import { ConfigService } from 'nestjs-config';
import { StatsChartsController } from './controller/charts/stats-charts.controller';
import { ChartsService } from './service/charts/charts.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: (config: ConfigService) => config.get('elastic'),
      inject: [ConfigService],
    }),
  ],
  providers: [StatsService, StatsQueries, CsvService, ChartsService],
  exports: [StatsService, CsvService, ChartsService],
  controllers: [
    StatsUIController,
    StatsAPIController,
    StatsCSVController,
    StatsChartsController,
  ],
})
export class StatsModule {}
