import { ConfigObject, registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env.development' });

const config: ConfigObject = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'postgres',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.DATABASE_QUERY_LOGGING,
  schema: 'public',
  uuidExtension: 'uuid-ossp',
  ssl: false, 
  extra: {
    softDelete: true,
  },
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
