import parseArgs from 'minimist';
import axios from 'axios';
import * as jobs from './jobs';
import Container, {
  Config,
  Input,
  Logger,
  MailerFactory,
  Runner,
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

const jobName = process.argv[2];
const args = parseArgs(process.argv.splice(3));

async function main() {
  await container.services.runner.run(jobName, args);
}

main();
