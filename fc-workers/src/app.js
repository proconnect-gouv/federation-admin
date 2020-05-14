import parseArgs from 'minimist';
import axios from 'axios';
// import elasticsearch from 'elasticsearch';
import elasticsearch from '@elastic/elasticsearch';
import * as jobs from './jobs';
import Container, {
  Config,
  Input,
  Logger,
  MailerFactory,
  Runner,
  Stats,
  FcDatabase,
} from './services';

const container = new Container();

container.add('logger', () => new Logger());
container.add('config', () => new Config(process.env));
container.add('input', () => Input);
container.add('httpClient', () => axios);
container.add('mailer', () =>
  MailerFactory.get(container.get('config').getMailerType(), container)
);
container.add('runner', () => new Runner(container, jobs, Input));
container.add(
  'dataApi',
  () => new elasticsearch.Client(container.get('config').getElastic())
);
container.add(
  'logApi',
  () => new elasticsearch.Client(container.get('config').getLogElastic())
);
container.add('fcDatabase', () =>
  FcDatabase.getInstance(container.get('config').getMongo())
);
container.add('stats', () => new Stats(container));

const jobName = process.argv[2];
const args = parseArgs(process.argv.splice(3));

async function main() {
  try {
    await container.get('runner').run(jobName, args);
  } catch (e) {
    container.get('logger').error(e);
  }
}

main();
