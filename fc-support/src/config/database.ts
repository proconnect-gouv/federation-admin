import { join, resolve } from 'path';

export = {
  type: process.env.DB_TYPE || 'sqlite',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10),
  database:
    process.env.DB_DATABASE || resolve(__dirname, '../../fc-support.sqlite'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  synchronize: false, // do not set to true, we do not want schema automatic creation
  entities: [
    resolve(
      __dirname,
      '../../../shared/!(node_modules)/**/*.sql.entity{.ts,.js}',
    ),
  ],
  migrations: [
    join(__dirname, '../../migrations/*{.ts,.js}'),
    join(__dirname, '../../../shared/migrations/**/*{.ts,.js}'),
  ],
  cli: {
    migrationsDir: 'migrations',
  },
};
