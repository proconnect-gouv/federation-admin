import { RnippActions, RnippStates } from '@fc/shared/rnipp/rnipp-actions.enum';
import { IIdentityHash } from './interface/identity-hash.interface';

export interface IRnippTrack {
  action: RnippActions;
  state: RnippStates;
  user: string;
  reason: string;
  code?: number;
  identityHash?: IIdentityHash;
}
