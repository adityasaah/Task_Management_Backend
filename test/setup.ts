import 'reflect-metadata';
import { config } from 'dotenv';
import { runMigrations } from '../src/database/run-migrations';

// Load test environment variables
config({ path: '.env.test' });

// Run migrations before all tests
const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/tasks_test';
await runMigrations(databaseUrl);
