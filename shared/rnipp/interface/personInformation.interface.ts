import { Person } from './person.interface';
import { PersonFromRnipp } from './personFromRnipp.interface';

export interface PersonInformation {
  readonly requested: Person;
  readonly found: PersonFromRnipp;
}
