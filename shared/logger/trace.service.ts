import { Injectable } from '@nestjs/common';
import { ConfigService, InjectConfig } from 'nestjs-config';
import { ITrace } from './interface/trace.interface';
import { LoggerService } from './logger.service';

export interface ITraceService {
  supportRnippCall(log: ITrace): void;
}

@Injectable()
export class TraceService extends LoggerService implements ITraceService {
  constructor(@InjectConfig() readonly config: ConfigService) {
    super(config);
  }

  public supportRnippCall(log: ITrace) {
    this.info(log);
  }
}
