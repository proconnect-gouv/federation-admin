import express from 'express';
import elasticsearch from 'elasticsearch';
import Container, { Config, Input, Stats } from './services';
import { ApiV1 } from './routers';

const container = new Container();
const app = express();

container.add('config', new Config(process.env));
container.add('input', Input);
container.add(
  'model',
  new elasticsearch.Client(container.services.config.getElastic())
);
container.add('stats', new Stats(container.services.model));

app.use('/api/v1', new ApiV1(container));

app.get('/', (req, res) => {
  res.send("I'm alive!\n");
});

app.start = port =>
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`App listening on port ${port}`);
  });

export default app;
