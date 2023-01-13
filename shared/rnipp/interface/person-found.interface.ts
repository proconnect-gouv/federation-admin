import { PersonInformationInterface } from './person-information.interface';
import { RnippInformationInterface } from './rnipp-information.interface';

export interface Personfound {
  person: PersonInformationInterface;
  rnippResponse: RnippInformationInterface;
}
