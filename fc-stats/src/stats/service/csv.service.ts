import { Injectable } from '@nestjs/common';
import * as CSVStringifier from 'csv-stringify';

@Injectable()
export class CsvService {
  getStringifier(options: object) {
    return CSVStringifier(options);
  }
}
