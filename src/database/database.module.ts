import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as taskSchema from '../tasks/schema';
import { DATABASE_CONNECTION } from './database-connection';

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          connectionString: configService.get('DATABASE_URL'),
        });
        return drizzle(pool, {
          schema: {
            ...taskSchema,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
