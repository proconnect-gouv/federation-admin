import express from 'express';
import elasticsearch from 'elasticsearch';
import Container from './services/Container';
import Config from './services/Config';
import Logger from './services/Logger';
import Authentication from './services/Authentication';
import InputValidator from './services/InputValidator/InputValidator';
import * as validators from './services/InputValidator/validators';
import Stats from './services/Stats/Stats';
import ApiV1 from './routers/Apiv1';

const container = new Container();
const app = express();

container.add('config', new Config(process.env));
container.add('logger', new Logger());
container.add('input', new InputValidator([validators]));
container.add(
  'dataApi',
  new elasticsearch.Client(container.services.config.getElastic())
);
container.add('stats', new Stats(container.services.dataApi));
container.add(
  'authentication',
  new Authentication(container.services.config.getAuthentication())
);

app.use((req, res, next) => {
  container.services.logger.log(`${req.method} ${req.url}`);
  next();
});

app.use(
  container.services.authentication.middleware.bind(
    container.services.authentication
  )
);

app.use('/api/v1', new ApiV1(container));

app.get('/', (req, res) => {
  res.send("I'm alive!\n");
});

app.start = port =>
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    container.services.logger.log(`App listening on port ${port}`);
  });

if (process.env.NODE_ENV !== 'test') {
  app.start(container.services.config.getPort());
}

export default app;
