import parseArgs from 'minimist';
import axios from 'axios';
import elasticsearch from 'elasticsearch';
import * as jobs from './jobs';
import Container, {
  Config,
  Input,
  Logger,
  MailerFactory,
  Runner,
  Stats,
} from './services';

const container = new Container();

container.add('logger', new Logger());
container.add('config', new Config(process.env));
container.add('input', Input);
container.add('httpClient', axios);
container.add(
  'mailer',
  MailerFactory.get(container.services.config.getMailerType(), container)
);
container.add('runner', new Runner(container, jobs, Input));
container.add(
  'dataApi',
  new elasticsearch.Client(container.services.config.getElastic())
);
container.add('stats', new Stats(container.services.dataApi));

const jobName = process.argv[2];
const args = parseArgs(process.argv.splice(3));

async function main() {
  try {
    await container.services.runner.run(jobName, args);
  } catch (e) {
    container.services.logger.error(e);
  }
}

main();
