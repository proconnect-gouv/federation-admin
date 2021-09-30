// eslint-disable-next-line max-classes-per-file
import Runner from '../../../src/services/Runner';
import Job from '../../../src/jobs/Job';
import Container from '../../../src/services/Container';

describe('Runner', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('usage', () => {
    // Given
    const jobs = { foo: {}, bar: {} };
    const runner = new Runner(null, jobs);
    // When
    const result = runner.usage();
    // Then
    expect(typeof result).toBe('string');
  });

  describe('isJob', () => {
    it('Should return true if job exists', () => {
      // Given
      const jobs = { foo: {}, bar: {} };
      const runner = new Runner(null, jobs);
      // When
      const result = runner.isJob('foo');
      // Then
      expect(result).toBe(true);
    });
    it('Should return false if job does not exists', () => {
      // Given
      const jobs = { foo: {}, bar: {} };
      const runner = new Runner(null, jobs);
      // When
      const result = runner.isJob('wizz');
      // Then
      expect(result).toBe(false);
    });
  });

  describe('run', () => {
    const container = {
      services: {
        logger: {
          info: jest.fn(),
          error: jest.fn(),
          log: jest.fn(),
          debug: jest.fn(),
        },
      },
    };
    container.get = key => container.services[key];

    const runMock = jest.fn();
    const usageMock = jest.fn();
    class Foo extends Job {
      static usage() {
        usageMock();
        return 'usage text';
      }

      // eslint-disable-next-line class-methods-use-this
      async run(params) {
        runMock(params);
        return true;
      }
    }

    beforeEach(() => {
      jest.spyOn(process, 'exit').mockImplementation(() => {});
    });

    it('Should throw if no job name provided', () => {
      // Given
      const jobs = { foo: {}, bar: {} };
      container.get = key => container.services[key];

      const runner = new Runner(container, jobs);
      runner.traceIndices = jest.fn();
      // When
      runner.run();
      // Then
      expect(container.services.logger.error.mock.calls).toHaveLength(1);
      expect(container.services.logger.error.mock.calls[0][0]).toBe(
        'An error occured: No job specified'
      );
      expect(container.services.logger.debug.mock.calls).toHaveLength(1);
      expect(container.services.logger.log.mock.calls).toHaveLength(1);
    });
    it('Should throw if job does not exists', () => {
      // Given
      const jobs = { foo: {}, bar: {} };
      const runner = new Runner(container, jobs);
      runner.traceIndices = jest.fn();
      // When
      runner.run('wizz');
      // Then
      expect(container.services.logger.error.mock.calls).toHaveLength(1);
      expect(container.services.logger.error.mock.calls[0][0]).toBe(
        'An error occured: Unknow job <wizz>'
      );
      expect(container.services.logger.debug.mock.calls).toHaveLength(1);
      expect(container.services.logger.log.mock.calls).toHaveLength(1);
    });
    it('Should throw if job does not implement run() method', async () => {
      // Given
      class Bar extends Job {}
      const jobs = { Bar };
      const runner = new Runner(container, jobs);
      runner.handleError = jest.fn();
      runner.traceIndices = jest.fn();

      // When
      await runner.run('Bar');
      // Then
      expect(runner.handleError.mock.calls).toHaveLength(1);
      expect(runner.handleError.mock.calls[0][0].message).toBe(
        'job.run is not a function'
      );
    });
    it('Should call the usage func of job and not run it', async () => {
      // Given
      const jobs = { Foo };
      const runner = new Runner(container, jobs);
      const params = { help: true };
      // When
      await runner.run('Foo', params);
      // Then
      expect(usageMock.mock.calls).toHaveLength(1);
      expect(container.services.logger.log.mock.calls).toHaveLength(1);
      expect(container.services.logger.log.mock.calls[0][0]).toBe('usage text');
    });
    it('Should call the run() method of job', () => {
      // Given
      const jobs = { Foo };
      const runner = new Runner(container, jobs);
      runner.traceIndices = jest.fn();
      // When
      runner.run('Foo');
      // Then
      expect(runMock.mock.calls).toHaveLength(1);
    });
    it('Should inject service container into job', () => {
      // Given
      const runMock2 = jest.fn();
      class Bar {
        constructor(_container) {
          runMock2(_container);
        }

        // eslint-disable-next-line class-methods-use-this
        run() {}
      }
      const jobs = { Bar };
      const runner = new Runner(container, jobs);
      runner.traceIndices = jest.fn();
      // When
      runner.run('Bar');
      // Then
      expect(runMock2.mock.calls[0][0]).toBe(container);
    });
    it('Should pass params method run()', () => {
      // Given
      const jobs = { Foo };
      const params = {};
      const runner = new Runner(container, jobs);
      runner.traceIndices = jest.fn();
      // When
      runner.run('Foo', params);
      // Then
      expect(runMock.mock.calls[0][0]).toBe(params);
    });

    it('Should log the ES indices when it starts running', () => {
      // Given
      const jobs = { Foo };
      const runner = new Runner(container, jobs);
      runner.traceIndices = jest.fn();
      // When
      runner.run('Foo');
      // Then
      expect(runner.traceIndices).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleError', () => {
    let mockExit;
    beforeEach(() => {
      mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    });
    it('Should not log stack if error is not input and env is not dev', () => {
      // Given
      const error = { message: 'foo' };
      const jobName = 'bar';
      const container = {
        services: {
          logger: { error: jest.fn(), log: jest.fn(), debug: jest.fn() },
        },
      };
      container.get = key => container.services[key];
      const jobs = { foo: 'foo' };
      const runner = new Runner(container, jobs);
      // When
      runner.handleError(error, jobName);
      // Then
      expect(container.services.logger.error.mock.calls).toHaveLength(1);
      expect(container.services.logger.error.mock.calls[0][0]).toBe(
        `An error occured: ${error.message}`
      );
      expect(container.services.logger.log.mock.calls).toHaveLength(1);
      expect(container.services.logger.log.mock.calls[0][0]).toBe(`
      This tool is intendeed to run jobs

      Available jobs:
      - foo : undefined

      To get more info about a specific job, run
      > ./run <jobName> --help
    `);
      expect(container.services.logger.debug.mock.calls).toHaveLength(1);
      expect(container.services.logger.debug.mock.calls[0][0]).toBe(error);
      expect(mockExit).toHaveBeenCalledWith(127);
    });
    it('Should log stack if error is input', () => {
      // Given
      const error = { type: 'input', message: 'foo', stack: { fizz: 'buzz ' } };
      const jobName = 'bar';
      const container = {
        services: {
          logger: { error: jest.fn(), log: jest.fn(), debug: jest.fn() },
        },
      };
      container.get = key => container.services[key];
      const jobs = { foo: 'foo' };
      const runner = new Runner(container, jobs);
      // When
      runner.handleError(error, jobName);
      // Then
      expect(container.services.logger.error.mock.calls).toHaveLength(2);
      expect(container.services.logger.error.mock.calls[1][0]).toBe(
        error.stack
      );
      expect(container.services.logger.log.mock.calls).toHaveLength(0);
    });
    it("Should call job's usage function", () => {
      // Given
      const error = { type: 'input', message: 'foo', stack: { fizz: 'buzz ' } };
      const jobName = 'bar';
      const container = {
        services: {
          logger: { error: jest.fn(), log: jest.fn(), debug: jest.fn() },
        },
      };
      container.get = key => container.services[key];
      const jobs = { bar: { usage: jest.fn(() => 'usage text') } };
      const runner = new Runner(container, jobs);
      // When
      runner.handleError(error, jobName);
      // Then
      expect(container.services.logger.log.mock.calls).toHaveLength(1);
      expect(container.services.logger.log.mock.calls[0][0]).toBe('usage text');
      expect(jobs.bar.usage.mock.calls).toHaveLength(1);
    });
  });

  describe('traceIndices()', () => {
    let runner;

    const loggerMock = {
      debug: jest.fn(),
    };

    const configMock = {
      getElasticMainIndex: jest.fn(),
      getElasticMetricsIndex: jest.fn(),
      getElasticEventsIndex: jest.fn(),
    };

    const container = new Container();
    container.add('logger', () => loggerMock);
    container.add('config', () => configMock);

    beforeEach(() => {
      configMock.getElasticMainIndex.mockReturnValueOnce('alpha');
      configMock.getElasticMetricsIndex.mockReturnValueOnce('bravo');
      configMock.getElasticEventsIndex.mockReturnValueOnce('charlie');

      runner = new Runner(container);
    });
    it('should return the list of indices of ES from config', () => {
      // Given

      const loggerDebugMock =
        '/!\\/!\\/!\\/!\\/!\\/!\\/!\\/!\\/!\\/!\\/!\\ \n > current indices to handle ES:\n   * main : alpha\n   * metrics : bravo\n   * events : charlie';

      // When
      runner.traceIndices();

      // Then
      expect(loggerMock.debug).toHaveBeenCalledTimes(1);
      expect(loggerMock.debug).toHaveBeenCalledWith(loggerDebugMock);

      expect(configMock.getElasticMainIndex).toHaveBeenCalledTimes(1);
      expect(configMock.getElasticMetricsIndex).toHaveBeenCalledTimes(1);
      expect(configMock.getElasticEventsIndex).toHaveBeenCalledTimes(1);
    });
  });
});
