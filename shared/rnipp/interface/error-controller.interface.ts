import { PersonInformation } from '../dto/person-information.dto';

export interface ErrorControllerInterface<T = any> {
  appName: string;
  rawResponse?: T;
  statusCode?: number;
  rnippCode?: string;
  csrfToken: string;
  persons: PersonInformation[];
  message: string | string[];
  supportId: string;
}
