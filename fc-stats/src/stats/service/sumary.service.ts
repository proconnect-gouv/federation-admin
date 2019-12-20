import { Injectable } from '@nestjs/common';
import { ISummary } from '../interfaces/summary.interface';
import { getData, formatDate } from '../summary.data';

@Injectable()
export class SummaryService {
  getSummary(): ISummary[] {
    // Oldest data in FC stats
    const overAllStart = formatDate(new Date('2016-01-01'));
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    return getData({
      start: overAllStart,
      stop: formatDate(yesterday),
      granularity: 'month',
      visualize: 'line',
      x: 'date',
      y: 'key',
    });
  }
}
