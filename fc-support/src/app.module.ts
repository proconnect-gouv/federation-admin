import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmService } from './database/typeorm.service';
import { EnvModule } from './env/env.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      useClass: TypeOrmService,
    }),
    EnvModule,
  ],
})
export class AppModule {}
