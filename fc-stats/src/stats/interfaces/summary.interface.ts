import { ISummaryEntry } from './summary-entry.interface';

export interface ISummary {
  label: string;
  list: ISummaryEntry[];
}
