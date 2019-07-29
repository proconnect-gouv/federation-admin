import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { StatsService } from './stats.service';
import { StatsQueries } from './stats.queries';
import { StatsUIController } from './controller/stats-ui.controller';
import { StatsAPIController } from './controller/stats-api.controller';
import { ConfigService } from 'nestjs-config';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: (config: ConfigService) => config.get('elastic'),
      inject: [ConfigService],
    }),
  ],
  providers: [StatsService, StatsQueries],
  exports: [StatsService],
  controllers: [StatsUIController, StatsAPIController],
})
export class StatsModule {}
