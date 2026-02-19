import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').notNull().primaryKey(),
  githubId: integer('github_id').unique(),
  username: text('username').notNull(),
})

export const organizations = sqliteTable('organizations', {
  id: text('id').notNull().primaryKey(),
  name: text('name').notNull(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  themeSettings: text('theme_settings', { mode: 'json' }), // For customizable UI
})

export const sessions = sqliteTable('sessions', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at').notNull(),
})
