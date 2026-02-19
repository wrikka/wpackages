import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { organizations, users } from './core'

export const agents = sqliteTable('agents', {
  id: text('id').notNull().primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  name: text('name').notNull(),
  description: text('description'),
  systemPrompt: text('system_prompt').notNull(),
  model: text('model').notNull().default('gpt-4'),
  settings: text('settings', { mode: 'json' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const tools = sqliteTable('tools', {
  id: text('id').notNull().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  schema: text('schema', { mode: 'json' }).notNull(), // Tool function schema
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const agentTools = sqliteTable('agent_tools', {
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  toolId: text('tool_id').notNull().references(() => tools.id, { onDelete: 'cascade' }),
}, (table) => ({ pk: primaryKey({ columns: [table.agentId, table.toolId] }) }))

export const agentPromptHistory = sqliteTable('agent_prompt_history', {
  id: text('id').notNull().primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  systemPrompt: text('system_prompt'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const longTermMemory = sqliteTable('long_term_memory', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  agentId: text('agent_id').references(() => agents.id),
  content: text('content').notNull(),
  embedding: text('embedding', { mode: 'json' }),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
