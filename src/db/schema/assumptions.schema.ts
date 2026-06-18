import { pgTable, uuid, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { roadmapsTable } from './roadmaps.schema';

export const assumptionsTable = pgTable(
  'assumptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roadmapId: uuid('roadmap_id')
      .notNull()
      .references(() => roadmapsTable.id, { onDelete: 'cascade' }),
    statement: text('statement').notNull(),
    riskLevel: varchar('risk_level', { length: 20 }).notNull().default('medium'), // low | medium | high
    isValidated: varchar('is_validated', { length: 20 }).notNull().default('pending'), // pending | validated | invalidated
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    roadmapIdIdx: index('assumptions_roadmap_id_idx').on(table.roadmapId),
  }),
);

export type Assumption = typeof assumptionsTable.$inferSelect;
export type NewAssumption = typeof assumptionsTable.$inferInsert;
