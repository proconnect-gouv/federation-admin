import { ILog } from './log.interface';

export interface ITrace extends ILog {
  user: string;
  motif?: string;
  accountId: string;
}
