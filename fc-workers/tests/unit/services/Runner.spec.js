import Runner from '../../../src/services/Runner';

describe('Runner', () => {
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
    it('Should throw if no job name provided', () => {
      // Given
      const jobs = { foo: {}, bar: {} };
      const container = {
        services: {
          logger: { debug: jest.fn(), log: jest.fn(), error: jest.fn() },
        },
      };
      jest.spyOn(process, 'exit').mockImplementation(() => {});
      const runner = new Runner(container, jobs);
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
      const container = {
        services: {
          logger: { debug: jest.fn(), log: jest.fn(), error: jest.fn() },
        },
      };
      const runner = new Runner(container, jobs);
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
      class foo {}
      const jobs = { foo };
      const runner = new Runner(null, jobs);
      runner.handleError = jest.fn();
      // When
      await runner.run('foo');
      // Then
      expect(runner.handleError.mock.calls).toHaveLength(1);
      expect(runner.handleError.mock.calls[0][0].message).toBe(
        'job.run is not a function'
      );
    });
    it('Should call the usage func of job and not run it', async () => {
      // Given
      const jobs = { foo: { usage: jest.fn(() => 'usage text') } };
      const container = { services: { logger: { log: jest.fn() } } };
      const runner = new Runner(container, jobs);
      const params = { help: true };
      // When
      await runner.run('foo', params);
      // Then
      expect(jobs.foo.usage.mock.calls).toHaveLength(1);
      expect(container.services.logger.log.mock.calls).toHaveLength(1);
      expect(container.services.logger.log.mock.calls[0][0]).toBe('usage text');
    });
    it('Should call the run() method of job', () => {
      // Given
      const runMock = jest.fn();
      class foo {
        constructor() {
          this.run = runMock;
        }
      }
      const jobs = { foo };
      const runner = new Runner(null, jobs);
      // When
      runner.run('foo');
      // Then
      expect(runMock.mock.calls).toHaveLength(1);
    });
    it('Should inject service container into job', () => {
      // Given
      const runMock = jest.fn();
      class foo {
        constructor(container) {
          this.container = container;
        }

        run() {
          runMock(this.container);
        }
      }
      const jobs = { foo };
      const container = {};
      const runner = new Runner(container, jobs);
      // When
      runner.run('foo');
      // Then
      expect(runMock.mock.calls[0][0]).toBe(container);
    });
    it('Should pass params method run()', () => {
      // Given
      const runMock = jest.fn();
      class foo {
        constructor() {
          this.run = runMock;
        }
      }
      const jobs = { foo };
      const params = {};
      const runner = new Runner(null, jobs);
      // When
      runner.run('foo', params);
      // Then
      expect(runMock.mock.calls[0][0]).toBe(params);
    });
  });

  describe('handleError', () => {
    it('Should not log stack if error is not input and env is not dev', () => {
      // Given
      const error = { message: 'foo' };
      const jobName = 'bar';
      const container = {
        services: {
          logger: { error: jest.fn(), log: jest.fn(), debug: jest.fn() },
        },
      };
      const jobs = { foo: 'foo' };
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
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
});
