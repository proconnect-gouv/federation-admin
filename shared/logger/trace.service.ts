import { Injectable } from '@nestjs/common';
import { ConfigService, InjectConfig } from 'nestjs-config';
import { ITrace } from './interface/trace.interface';
import { IRnippCall } from './interface/rnipp-call.interface';
import { ICitizenManagement } from './interface/citizen-management.interface';
import { LoggerService } from './logger.service';

export interface ITraceService {
  supportRnippCall(log: IRnippCall): void;
  supportUserAcountStatus(log: ITrace): void;
}

@Injectable()
export class TraceService extends LoggerService implements ITraceService {
  constructor(@InjectConfig() readonly config: ConfigService) {
    super(config);
  }

  public supportRnippCall(log: IRnippCall) {
    this.info(log);
  }

  public supportUserAcountStatus(log: ICitizenManagement) {
    this.info(log);
  }
}
