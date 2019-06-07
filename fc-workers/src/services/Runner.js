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
    }

    logger.debug(error);
    process.exit(127);
  }

  async run(jobName, params) {
    if (typeof jobName === 'undefined' || jobName === '') {
      throw new Error('No job specified');
    }

    if (!this.isJob(jobName)) {
      throw new Error(`Unknow job <${jobName}>`);
    }

    try {
      if (params && params.help) {
        this.container.services.logger.log(this.jobs[jobName].usage());
      } else {
        const job = new this.jobs[jobName](this.container);
        await job.run(params);
      }
    } catch (error) {
      this.handleError(error, jobName);
    }
  }
}

export default Runner;
