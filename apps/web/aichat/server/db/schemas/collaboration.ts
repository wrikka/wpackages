import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { organizations, users } from './core'
import { chatSessions } from './chat'

export const organizationMembers = sqliteTable('organization_members', {
  organizationId: text('organization_id').notNull().references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['owner', 'member', 'guest'] }).notNull(),
})

export const guestInvites = sqliteTable('guest_invites', {
  chatSessionId: text('chat_session_id').references(() => chatSessions.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  id: text('id').notNull().primaryKey(),
  inviterId: text('inviter_id').notNull().references(() => users.id),
  organizationId: text('organization_id').notNull().references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  token: text('token').notNull().unique(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
})

export const groups = sqliteTable('groups', {
  description: text('description'),
  id: text('id').notNull().primaryKey(),
  name: text('name').notNull(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, {
    onDelete: 'cascade',
  }),
})

export const groupMembers = sqliteTable('group_members', {
  groupId: text('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['member', 'admin'] }).notNull().default('member'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => ({ pk: primaryKey({ columns: [table.groupId, table.userId] }) }))

export const folders = sqliteTable('folders', {
  id: text('id').notNull().primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  parentId: text('parent_id').references(() => folders.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
})

export const folderMembers = sqliteTable('folder_members', {
  folderId: text('folder_id').notNull().references(() => folders.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['editor', 'viewer'] }).notNull(),
}, (table) => ({ pk: primaryKey({ columns: [table.folderId, table.userId] }) }))
