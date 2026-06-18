import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { roadmapsTable } from './roadmaps.schema';

export const milestonesTable = pgTable(
  'milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roadmapId: uuid('roadmap_id')
      .notNull()
      .references(() => roadmapsTable.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    dayBucket: integer('day_bucket').notNull(), // 30, 60, or 90
    orderIndex: integer('order_index').notNull().default(0),
    isAccepted: boolean('is_accepted').notNull().default(false), // HITL approval flag
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    roadmapIdIdx: index('milestones_roadmap_id_idx').on(table.roadmapId),
  }),
);

export type Milestone = typeof milestonesTable.$inferSelect;
export type NewMilestone = typeof milestonesTable.$inferInsert;
