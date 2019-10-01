import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { StatsService } from './service/stats.service';
import { CsvService } from './service/csv.service';
import { StatsQueries } from './stats.queries';
import { StatsUIController } from './controller/stats-ui.controller';
import { StatsAPIController } from './controller/stats-api.controller';
import { StatsCSVController } from './controller/stats-csv.controller';
import { ConfigService } from 'nestjs-config';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: (config: ConfigService) => config.get('elastic'),
      inject: [ConfigService],
    }),
  ],
  providers: [StatsService, StatsQueries, CsvService],
  exports: [StatsService, CsvService],
  controllers: [StatsUIController, StatsAPIController, StatsCSVController],
})
export class StatsModule {}
