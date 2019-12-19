import { PersonInformation } from './person-information.interface';
import { RnippInformation } from './rnipp-information.interface';

export interface Personfound {
  person: PersonInformation;
  rnippResponse: RnippInformation;
}
