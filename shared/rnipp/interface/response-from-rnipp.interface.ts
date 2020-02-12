import { Person } from './person.interface';
import { IIdentityHash } from './identity-hash.interface';

export interface IResponseFromRnipp {
  rectifiedIdentity: Person;
  rnippCode: number;
  rnippDead: boolean;
  rawResponse: string;
  statusCode?: number;
  message?: string;
  identityHash?: IIdentityHash;
}
