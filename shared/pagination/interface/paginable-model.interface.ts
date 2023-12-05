/* istanbul ignore file */

// Declarative file
import { Model } from 'mongoose';
import { IOptions } from './options-query-mongodb.interface';

export interface PaginatedResult<T> {
  items: T[];
  itemCount: number;
  total: number;
  pageCount: number;
  next: string;
  previous: string;
}

export interface PaginableModel<T> extends Model<T> {
  paginate: (
    query: object,
    route: string,
    options: IOptions,
  ) => Promise<PaginatedResult<T>>;
}
