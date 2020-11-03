import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { EventUIListInputDTO } from './event-ui-list-input.dto';

describe('Service Provider Input (Data Transfer Object)', () => {
  const eventUIListInput = {
    start: '2020-01-01',
    stop: '2020-10-30',
    limit: 10,
    page: 0,
    granularity: 'month',
    visualize: 'list',
    x: 'date',
    y: 'fs',
    columns: ['fi', 'action'],
  };

  it('should validate if all properties are correct', async () => {
    // When | Action
    const eventUIListInputToClass = plainToClass(
      EventUIListInputDTO,
      eventUIListInput,
    );
    const error = await validate(eventUIListInputToClass);

    // Then | Assert
    expect(error.length).toEqual(0);
  });
});
