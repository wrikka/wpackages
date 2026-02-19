import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { conversations, messages, users } from './core';

// ==================== FEATURE 20: Conversation Favorites ====================
export const conversationFavorites = sqliteTable('conversation_favorites', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, {
    onDelete: 'cascade',
  }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const conversationFavoritesRelations = relations(conversationFavorites, ({ one }) => ({
  user: one(users, {
    fields: [conversationFavorites.userId],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [conversationFavorites.conversationId],
    references: [conversations.id],
  }),
}));

// ==================== FEATURE 13: Conversation Tags ====================
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').notNull().default('#3b82f6'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const conversationTags = sqliteTable('conversation_tags', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, {
    onDelete: 'cascade',
  }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  conversations: many(conversationTags),
}));

// ==================== FEATURE 8: Scheduled Messages ====================
export const scheduledMessages = sqliteTable('scheduled_messages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, {
    onDelete: 'cascade',
  }),
  content: text('content').notNull(),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['pending', 'sent', 'cancelled', 'failed'] }).notNull().default(
    'pending',
  ),
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const scheduledMessagesRelations = relations(scheduledMessages, ({ one }) => ({
  user: one(users, {
    fields: [scheduledMessages.userId],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [scheduledMessages.conversationId],
    references: [conversations.id],
  }),
}));

// ==================== FEATURE 6: Conversation Branching ====================
export const conversationBranches = sqliteTable('conversation_branches', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  parentConversationId: text('parent_conversation_id').notNull().references(
    () => conversations.id,
    { onDelete: 'cascade' },
  ),
  branchConversationId: text('branch_conversation_id').notNull().references(
    () => conversations.id,
    { onDelete: 'cascade' },
  ),
  branchPointMessageId: text('branch_point_message_id').references(() => messages.id, {
    onDelete: 'set null',
  }),
  branchName: text('branch_name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const conversationBranchesRelations = relations(conversationBranches, ({ one }) => ({
  parentConversation: one(conversations, {
    fields: [conversationBranches.parentConversationId],
    references: [conversations.id],
    relationName: 'parentConversation',
  }),
  branchConversation: one(conversations, {
    fields: [conversationBranches.branchConversationId],
    references: [conversations.id],
    relationName: 'branchConversation',
  }),
  branchPointMessage: one(messages, {
    fields: [conversationBranches.branchPointMessageId],
    references: [messages.id],
  }),
}));

// ==================== FEATURE 5: Agent Templates ====================
export const agentTemplates = sqliteTable('agent_templates', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  organizationId: text('organization_id'),
  name: text('name').notNull(),
  description: text('description'),
  systemPrompt: text('system_prompt').notNull(),
  category: text('category').notNull().default('general'),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  icon: text('icon').default('i-heroicons-robot'),
  tags: text('tags'), // JSON array
  usageCount: integer('usage_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const agentTemplatesRelations = relations(agentTemplates, ({ one }) => ({
  user: one(users, {
    fields: [agentTemplates.userId],
    references: [users.id],
  }),
}));

// ==================== FEATURE 1: Plugin Marketplace ====================
export const plugins = sqliteTable('plugins', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  version: text('version').notNull().default('1.0.0'),
  manifest: text('manifest').notNull(), // JSON
  code: text('code').notNull(), // Plugin code
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  isOfficial: integer('is_official', { mode: 'boolean' }).notNull().default(false),
  downloadCount: integer('download_count').notNull().default(0),
  rating: real('rating').default(0),
  ratingCount: integer('rating_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const userPlugins = sqliteTable('user_plugins', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  pluginId: text('plugin_id').notNull().references(() => plugins.id, { onDelete: 'cascade' }),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
  config: text('config'), // JSON
  installedAt: integer('installed_at', { mode: 'timestamp' }).notNull().$defaultFn(() =>
    new Date()
  ),
});

export const pluginsRelations = relations(plugins, ({ one, many }) => ({
  user: one(users, {
    fields: [plugins.userId],
    references: [users.id],
  }),
  users: many(userPlugins),
}));

// ==================== FEATURE 2: API Keys ====================
export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id'),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull(), // Hashed key
  keyPrefix: text('key_prefix').notNull(), // First 8 chars for display
  permissions: text('permissions'), // JSON array
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  isRevoked: integer('is_revoked', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

// ==================== FEATURE 3: Usage Analytics ====================
export const usageStats = sqliteTable('usage_stats', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id'),
  date: text('date').notNull(), // YYYY-MM-DD
  promptTokens: integer('prompt_tokens').notNull().default(0),
  completionTokens: integer('completion_tokens').notNull().default(0),
  totalTokens: integer('total_tokens').notNull().default(0),
  requestCount: integer('request_count').notNull().default(0),
  estimatedCost: real('estimated_cost').notNull().default(0),
  model: text('model').notNull().default('gpt-4'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const usageStatsRelations = relations(usageStats, ({ one }) => ({
  user: one(users, {
    fields: [usageStats.userId],
    references: [users.id],
  }),
}));

// ==================== FEATURE 4: Webhooks ====================
export const webhooks = sqliteTable('webhooks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id'),
  name: text('name').notNull(),
  url: text('url').notNull(),
  secret: text('secret'), // For signature verification
  events: text('events').notNull(), // JSON array of events
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  lastTriggeredAt: integer('last_triggered_at', { mode: 'timestamp' }),
  lastStatus: integer('last_status'), // HTTP status
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const webhookDeliveries = sqliteTable('webhook_deliveries', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  webhookId: text('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  event: text('event').notNull(),
  payload: text('payload').notNull(), // JSON
  status: integer('status'), // HTTP status
  response: text('response'),
  deliveredAt: integer('delivered_at', { mode: 'timestamp' }).notNull().$defaultFn(() =>
    new Date()
  ),
  duration: integer('duration'), // ms
});

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  user: one(users, {
    fields: [webhooks.userId],
    references: [users.id],
  }),
  deliveries: many(webhookDeliveries),
}));

// ==================== FEATURE 9: Conversation Summaries ====================
export const conversationSummaries = sqliteTable('conversation_summaries', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, {
    onDelete: 'cascade',
  }),
  summary: text('summary').notNull(),
  keyPoints: text('key_points'), // JSON array
  actionItems: text('action_items'), // JSON array
  generatedAt: integer('generated_at', { mode: 'timestamp' }).notNull().$defaultFn(() =>
    new Date()
  ),
  messageCount: integer('message_count').notNull(),
});

export const conversationSummariesRelations = relations(conversationSummaries, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationSummaries.conversationId],
    references: [conversations.id],
  }),
}));

// ==================== FEATURE 10: Team Workspaces ====================
export const workspaces = sqliteTable('workspaces', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organization_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon').default('i-heroicons-folder'),
  color: text('color').default('#3b82f6'),
  settings: text('settings'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const workspaceMembers = sqliteTable('workspace_members', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, {
    onDelete: 'cascade',
  }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['owner', 'admin', 'member'] }).notNull().default('member'),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
}));

// ==================== FEATURE 11: File Version Control ====================
export const fileVersions = sqliteTable('file_versions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  fileId: text('file_id').notNull(), // References knowledge_base_files
  version: integer('version').notNull(),
  filename: text('filename').notNull(),
  content: text('content'), // Extracted text content
  metadata: text('metadata'), // JSON
  size: integer('size').notNull(),
  hash: text('hash').notNull(), // File hash
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  changeSummary: text('change_summary'), // AI-generated summary of changes
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const fileVersionsRelations = relations(fileVersions, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [fileVersions.uploadedBy],
    references: [users.id],
  }),
}));

// ==================== FEATURE 7: Custom Models ====================
export const customModels = sqliteTable('custom_models', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id'),
  name: text('name').notNull(),
  provider: text('provider', { enum: ['openai', 'anthropic', 'ollama', 'custom'] }).notNull(),
  modelId: text('model_id').notNull(), // e.g., 'gpt-4', 'claude-3'
  apiKey: text('api_key'), // Encrypted
  baseUrl: text('base_url'), // For custom/Ollama
  config: text('config'), // JSON - temperature, max_tokens, etc
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const customModelsRelations = relations(customModels, ({ one }) => ({
  user: one(users, {
    fields: [customModels.userId],
    references: [users.id],
  }),
}));

// ==================== FEATURE 12: Search Index ====================
export const searchIndex = sqliteTable('search_index', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  type: text('type', { enum: ['conversation', 'message', 'knowledge_base'] }).notNull(),
  entityId: text('entity_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  content: text('content').notNull(),
  searchVector: text('search_vector'), // For FTS
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ==================== FEATURE 19: Rate Limits ====================
export const rateLimits = sqliteTable('rate_limits', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id'),
  type: text('type', { enum: ['user', 'org'] }).notNull(),
  maxRequestsPerMinute: integer('max_requests_per_minute').default(60),
  maxTokensPerDay: integer('max_tokens_per_day').default(100000),
  maxConversationsPerDay: integer('max_conversations_per_day').default(100),
  blockedUntil: integer('blocked_until', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ==================== FEATURE 25: Message Drafts ====================
export const messageDrafts = sqliteTable('message_drafts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, {
    onDelete: 'cascade',
  }),
  content: text('content').notNull(),
  attachments: text('attachments'), // JSON array
  savedAt: integer('saved_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const messageDraftsRelations = relations(messageDrafts, ({ one }) => ({
  user: one(users, {
    fields: [messageDrafts.userId],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [messageDrafts.conversationId],
    references: [conversations.id],
  }),
}));

// ==================== FEATURE 15: Image Generation ====================
export const generatedImages = sqliteTable('generated_images', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationId: text('conversation_id').references(() => conversations.id, {
    onDelete: 'set null',
  }),
  prompt: text('prompt').notNull(),
  model: text('model').notNull().default('dall-e-3'),
  size: text('size').notNull().default('1024x1024'),
  quality: text('quality').notNull().default('standard'),
  style: text('style'),
  url: text('url'),
  localPath: text('local_path'),
  revisedPrompt: text('revised_prompt'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const generatedImagesRelations = relations(generatedImages, ({ one }) => ({
  user: one(users, {
    fields: [generatedImages.userId],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [generatedImages.conversationId],
    references: [conversations.id],
  }),
}));
