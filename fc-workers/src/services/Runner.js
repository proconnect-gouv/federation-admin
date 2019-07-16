class Runner {
  constructor(container, jobs, InputValidator) {
    this.container = container;
    this.jobs = jobs;
    this.inputValidator = InputValidator;
  }

  isJob(jobName) {
    const jobNames = Object.keys(this.jobs);
    return jobNames.indexOf(jobName) > -1;
  }

  usage() {
    const jobList = Object.keys(this.jobs)
      .map(jobName => `      - ${jobName} : ${this.jobs[jobName].description}`)
      .join('\n');

    return `
      This tool is intendeed to run jobs

      Available jobs:\n${jobList}

      To get more info about a specific job, run
      > ./run <jobName> --help
    `;
  }

  handleError(error, jobName) {
    const { logger } = this.container.services;
    logger.error(`An error occured: ${error.message}`);
    if (error.type === 'input') {
      logger.error(error.stack);

      if (this.jobs[jobName] && this.jobs[jobName].usage) {
        logger.log(this.jobs[jobName].usage());
      }
    } else {
      logger.log(this.usage());
    }

    logger.debug(error);
    process.exit(127);
  }

  async run(jobName, params) {
    if (typeof jobName === 'undefined' || jobName === '') {
      return this.handleError(new Error('No job specified'), jobName);
    }

    if (!this.isJob(jobName)) {
      return this.handleError(new Error(`Unknow job <${jobName}>`), jobName);
    }

    try {
      if (params && params.help) {
        return this.container.services.logger.log(this.jobs[jobName].usage());
      }
      const job = new this.jobs[jobName](this.container);
      return job.run(params);
    } catch (error) {
      return this.handleError(error, jobName);
    }
  }
}

export default Runner;
