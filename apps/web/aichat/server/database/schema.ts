export * from './schema/index';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  aiNickname: text('ai_nickname'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
