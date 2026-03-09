import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),

  title: text('title').notNull(),

  description: text('description'),

  isCompleted: boolean('is_completed').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
