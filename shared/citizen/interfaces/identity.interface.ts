import { IPivotIdentity } from './pivot-identity.interface';

export interface IIdentity extends IPivotIdentity {
  readonly preferredUsername: string;
}
