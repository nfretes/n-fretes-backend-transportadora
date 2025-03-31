import { ConfigObject, registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env.development' });

const config: ConfigObject = {
  type: 'postgres',
  host: `${process.env.DATABASE_HOST}`,
  username: `${process.env.DATABASE_USERNAME}`,
  password: `${process.env.DATABASE_PASSWORD}`,
  database: `${process.env.DATABASE_NAME}`,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: `${process.env.DATABASE_QUERY_LOGGING}`,
  schema: 'public',
  uuidExtension: 'uuid-ossp',
  ssl: process.env.DB_SSL,
  extra: {
    softDelete: true,
    ssl: {
      rejectUnauthorized: false,
    },
  },
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
