import { Person } from './person.interface';
import { IResponseFromRnipp } from './response-from-rnipp.interface';

export interface PersonInformation {
  readonly requested: Person;
  readonly found: IResponseFromRnipp;
}
