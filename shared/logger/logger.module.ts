import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { TraceService } from './trace.service';

@Global()
@Module({
  providers: [LoggerService, TraceService],
  exports: [LoggerService, TraceService],
})
export class LoggerModule {}
