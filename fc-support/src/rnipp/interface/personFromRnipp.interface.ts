import { Person } from './person.interface';

export interface PersonFromRnipp {
  personFoundByRnipp: Person;
  rnippCode: number;
  rawResponse: string;
  statusCode?: number;
  message?: string;
}
