import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  integer,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const tasks = pgTable(
  'tasks',
  {
    id: serial('id').primaryKey(),

    title: text('title').notNull(),

    description: text('description'),

    isCompleted: boolean('is_completed').default(false).notNull(),

    targetProgress: integer('target_progress').notNull().default(100),

    currentProgress: integer('current_progress').notNull().default(0),

    metric: text('metric').notNull().default('percentage'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueTitle: uniqueIndex('unique_title_lower').on(
      sql`lower(${table.title})`,
    ),
  }),
);
