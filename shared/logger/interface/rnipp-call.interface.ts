import { ITrace } from './trace.interface';

export interface IRnippCall extends ITrace {
  code?: number;
  identityHash?: {
    idp: string;
    rnipp?: string;
  };
}
