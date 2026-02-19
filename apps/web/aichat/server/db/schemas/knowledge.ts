import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { organizations } from './core'
import { groups } from './collaboration'
import { messages } from './chat'

export const knowledgeBases = sqliteTable('knowledge_bases', {
  id: text('id').notNull().primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  name: text('name').notNull(),
  description: text('description'),
  settings: text('settings', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const knowledgeBaseGroupPermissions = sqliteTable('knowledge_base_group_permissions', {
  groupId: text('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  knowledgeBaseId: text('knowledge_base_id').notNull().references(() => knowledgeBases.id, {
    onDelete: 'cascade',
  }),
}, (table) => ({ pk: primaryKey({ columns: [table.knowledgeBaseId, table.groupId] }) }))

export const knowledgeBaseSources = sqliteTable('knowledge_base_sources', {
  id: text('id').notNull().primaryKey(),
  knowledgeBaseId: text('knowledge_base_id').notNull().references(() => knowledgeBases.id, {
    onDelete: 'cascade',
  }),
  type: text('type').notNull(), // 'file', 'url', 'text'
  source: text('source').notNull(),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const knowledgeBaseFiles = sqliteTable('knowledge_base_files', {
  id: text('id').notNull().primaryKey(),
  knowledgeBaseId: text('knowledge_base_id').notNull().references(() => knowledgeBases.id, {
    onDelete: 'cascade',
  }),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  content: text('content'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const fileChunks = sqliteTable('file_chunks', {
  id: text('id').notNull().primaryKey(),
  fileId: text('file_id').notNull().references(() => knowledgeBaseFiles.id, {
    onDelete: 'cascade',
  }),
  content: text('content').notNull(),
  embedding: text('embedding', { mode: 'json' }).notNull(),
})

export const messageSources = sqliteTable('message_sources', {
  messageId: text('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  chunkId: text('chunk_id').notNull().references(() => fileChunks.id, { onDelete: 'cascade' }),
}, (table) => ({ pk: primaryKey({ columns: [table.messageId, table.chunkId] }) }))
