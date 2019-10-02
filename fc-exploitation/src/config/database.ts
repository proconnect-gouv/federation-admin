import { join, resolve } from 'path';

export = {
  type: process.env.DB_TYPE || 'sqlite',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10),
  database:
    process.env.DB_DATABASE ||
    resolve(__dirname, '../../fc-exploitation.sqlite'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  synchronize: (process.env.DB_SYNCHRONIZE || 'false') === 'true',
  entities: [
    resolve(__dirname, '../../../shared/!(node_modules)/**/*.entity{.ts,.js}'),
  ],
  migrations: [
    join(__dirname, '../../migrations/*{.ts,.js}'),
    join(__dirname, '../../../shared/migrations/*{.ts,.js}'),
  ],
  cli: {
    migrationsDir: 'migrations',
  },
};
