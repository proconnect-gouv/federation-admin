import * as stringify from 'csv-stringify';
import { CsvService } from './csv.service';

describe('getStringifier', () => {
  it('Shoud return CSVStringifier', () => {
    // Given
    const service = new CsvService();
    // When
    const result = service.getStringifier({});
    // Then
    expect(JSON.stringify(result)).toEqual(JSON.stringify(stringify({})));
  });
});
