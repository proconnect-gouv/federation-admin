import { Person } from './person.interface';

export interface ParsedData {
  identity?: Person;
  dead?: boolean;
  rnippCode: string;
}
