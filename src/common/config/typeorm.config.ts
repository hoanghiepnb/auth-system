import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config();

console.log('TypeORM config - Current directory:', __dirname);
console.log('TypeORM config - Database connection:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  database: process.env.DB_NAME,
});

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'auth_db',
  entities: [
    path.join(__dirname, '..', 'base', 'abstract.entity.{ts,js}'),
    path.join(__dirname, '..', '..', 'domains', '**', '*.entity.{ts,js}')
  ],
  migrations: [path.join(__dirname, '..', '..', 'migrations', '*{.ts,.js}')],
  synchronize: false,
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
});

console.log(
  'TypeORM config - Entities path:',
  path.join(__dirname, '..', '..', 'domains', '**', '*.entity.{ts,js}'),
);

export default dataSource;
