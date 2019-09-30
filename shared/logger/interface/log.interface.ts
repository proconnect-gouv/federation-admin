import { LogActions } from '../enum/log-actions.enum';

export interface ILog {
  action: LogActions;
  state?: string;
}
