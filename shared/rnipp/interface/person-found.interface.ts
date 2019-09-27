import { PersonInformation } from './personInformation.interface';
import { RnippInformation } from './rnippInformation.interface';

export interface Personfound {
  person: PersonInformation;
  rnippResponse: RnippInformation;
}
