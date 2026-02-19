import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { organizations, users } from './core'

export const chatSessions = sqliteTable('chat_sessions', {
  provider: text('provider').notNull().default('openai'), // e.g., 'openai', 'anthropic', 'ollama'
  id: text('id').notNull().primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  title: text('title').notNull(),
  mode: text('mode').notNull().default('chat'), // e.g., 'chat', 'agent', 'code', 'summarize'
  model: text('model').notNull().default('gpt-4'),
  systemPrompt: text('system_prompt'),
  settings: text('settings', { mode: 'json' }), // For session-specific settings
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const messages = sqliteTable('messages', {
  chatSessionId: text('chat_session_id').notNull().references(() => chatSessions.id, {
    onDelete: 'cascade',
  }),
  id: text('id').notNull().primaryKey(),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  metadata: text('metadata', { mode: 'json' }), // For additional message data
  tool_calls: text('tool_calls', { mode: 'json' }),
  tool_results: text('tool_results', { mode: 'json' }),
})

export const messageMentions = sqliteTable('message_mentions', {
  messageId: text('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => ({ pk: primaryKey({ columns: [table.messageId, table.userId] }) }))

export const messageComments = sqliteTable('message_comments', {
  id: text('id').notNull().primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
