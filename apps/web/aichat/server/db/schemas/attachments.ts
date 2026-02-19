import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { organizations } from './core'
import { messages } from './chat'

export const attachments = sqliteTable('attachments', {
  textContent: text('text_content'),
  id: text('id').notNull().primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const messageAttachments = sqliteTable('message_attachments', {
  messageId: text('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  attachmentId: text('attachment_id').notNull().references(() => attachments.id, { onDelete: 'cascade' }),
}, (table) => ({ pk: primaryKey({ columns: [table.messageId, table.attachmentId] }) }))
