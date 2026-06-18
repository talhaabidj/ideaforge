import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

export const roadmapsTable = pgTable(
  'roadmaps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    rawIdea: text('raw_idea').notNull(),
    sixW3hSummary: text('six_w3h_summary'),
    status: varchar('status', { length: 50 }).notNull().default('draft'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('roadmaps_user_id_idx').on(table.userId),
  }),
);

export type Roadmap = typeof roadmapsTable.$inferSelect;
export type NewRoadmap = typeof roadmapsTable.$inferInsert;
