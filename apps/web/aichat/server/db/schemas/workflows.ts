import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { organizations, users } from './core'

export const workflows = sqliteTable('workflows', {
  id: text('id').notNull().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  definition: text('definition', { mode: 'json' }).notNull(), // JSON with nodes and edges
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  organizationId: text('organization_id').references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  userId: text('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const workflowExecutions = sqliteTable('workflow_executions', {
  id: text('id').notNull().primaryKey(),
  workflowId: text('workflow_id').notNull().references(() => workflows.id, {
    onDelete: 'cascade',
  }),
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed'] }).notNull(),
  input: text('input', { mode: 'json' }),
  output: text('output', { mode: 'json' }),
  error: text('error'),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
