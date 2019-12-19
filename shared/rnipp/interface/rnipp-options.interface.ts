import { HeadersOptions } from './headers.interface';

export interface RnippOptions {
  hostname: string;
  port: number;
  url: string;
  headers: HeadersOptions;
}
