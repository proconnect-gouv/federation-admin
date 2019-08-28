import { Test } from '@nestjs/testing';
import { StatsCSVController } from './stats-csv.controller';
import { StatsService } from '../service/stats.service';
import { StatsQueries } from '../stats.queries';
import { CsvService } from '../service/csv.service';

class StreamMock {
  data = [];
  finish = [];
  end = [];

  on(event, callback) {
    this[event].push(callback);
    return this;
  }

  emit(event, args) {
    this[event].forEach(listener => listener.apply(null, args));
    return this;
  }

  setEncoding() {
    return this;
  }
}

describe('StatsCSVController', () => {
  let statsController;
  let stream;
  let stringifier;

  const statsService = { streamEvents: () => stream };

  const csvService = { getStringifier: () => stringifier };

  const res = {
    setHeader: jest.fn(),
    status: jest.fn(),
    send: jest.fn(),
    end: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    stream = new StreamMock();
    stringifier = new StreamMock();

    const module = await Test.createTestingModule({
      providers: [StatsService, StatsQueries, CsvService],
      controllers: [StatsCSVController],
    })
      .overrideProvider(StatsService)
      .useValue(statsService)
      .overrideProvider(CsvService)
      .useValue(csvService)
      .compile();

    statsController = module.get<StatsCSVController>(StatsCSVController);
  });

  describe('list', () => {
    it('calls stream method', () => {
      // Given
      const query = {
        start: new Date('2019-01-01'),
        stop: new Date('2019-05-01'),
      };
      statsController.stream = jest.fn();
      // When
      statsController.list(query, res);
      // Then
      expect(statsController.stream).toHaveBeenCalledWith(res, stream);
    });
  });

  describe('stream', () => {
    it('should call sendData', done => {
      // Given
      statsController.sendData = jest.fn();
      // Then
      stream.on('end', () => {
        expect(statsController.sendData).toHaveBeenCalled();
        done();
      });

      // When
      statsController.stream(res, stream);
      stream.emit('data', { date: 1 });
      stream.emit('end');
    });
  });

  describe('formatEvent', () => {
    it('Should return an object with a typed date', () => {
      // Given
      const event = { date: 1564669095151 };
      // When
      const result = statsController.formatEvent(event);
      // Then
      expect(result.date).toBeDefined();
      expect(result.date).toBe('01/08/2019');
    });
  });

  describe('sendData', () => {
    it('Should call writeable stream write method', () => {
      // Given
      const writable = { write: jest.fn() };
      const data = { foo: 'sendData', date: 1564669095151 };
      // When
      statsController.sendData(writable, data);
      // Then
      expect(writable.write).toHaveBeenCalledTimes(1);
      expect(writable.write).toHaveBeenCalledWith({
        foo: 'sendData',
        date: '01/08/2019',
      });
    });
  });
});
