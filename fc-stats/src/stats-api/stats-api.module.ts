import { Global, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigService } from 'nestjs-config';
import { StatsApiController } from './stats-api.controller';
import { StatsApiService } from './service/stats-api.service';
import { StatsApiQueriesService } from './service/stats-api-queries.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: (config: ConfigService) => config.get('elastic'),
      inject: [ConfigService],
    }),
  ],
  controllers: [StatsApiController],
  providers: [StatsApiService, StatsApiQueriesService],
})
export class StatsApiModule {}
