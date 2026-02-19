import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { organizations, users } from './core'

export const promptTemplates = sqliteTable('prompt_templates', {
  id: text('id').notNull().primaryKey(),
  name: text('name').notNull(),
  promptText: text('prompt_text').notNull(),
  description: text('description'),
  category: text('category'),
  tags: text('tags', { mode: 'json' }), // JSON array of strings
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  organizationId: text('organization_id').references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  userId: text('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  rating: integer('rating').notNull().default(0),
  ratingCount: integer('rating_count').notNull().default(0),
  usageCount: integer('usage_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const promptRatings = sqliteTable('prompt_ratings', {
  id: text('id').notNull().primaryKey(),
  promptTemplateId: text('prompt_template_id').notNull().references(() => promptTemplates.id, {
    onDelete: 'cascade',
  }),
  userId: text('user_id').notNull().references(() => users.id, {
    onDelete: 'cascade',
  }),
  rating: integer('rating').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({ 
  pk: primaryKey({ columns: [table.promptTemplateId, table.userId] })
}))
