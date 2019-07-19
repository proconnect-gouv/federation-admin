import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { StatsService } from './stats.service';
import { StatsQueries } from './stats.queries';
import { StatsController } from './stats.controller';
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
  controllers: [StatsController],
})
export class StatsModule {}
