import { PersonInformation } from '../dto/person-information.dto';

export interface ErrorControllerInterface<T = any> {
  rawResponse?: T;
  statusCode?: number;
  rnippCode?: string;
  csrfToken: string;
  person: PersonInformation;
  message: string | string[];
}
