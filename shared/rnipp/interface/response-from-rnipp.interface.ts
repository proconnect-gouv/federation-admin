import { Person } from './person.interface';

export interface IResponseFromRnipp {
  rectifiedIdentity: Person;
  rnippCode: number;
  rawResponse: string;
  statusCode?: number;
  message?: string;
  identityHash?: {
    idp: string;
    rnipp?: string;
  };
}
