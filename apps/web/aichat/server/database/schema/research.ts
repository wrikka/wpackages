import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { conversations, messages } from './core';

export const researchTopics = sqliteTable('research_topics', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id),
  topic: text('topic').notNull(),
  status: text('status', { enum: ['pending', 'in_progress', 'completed', 'failed'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const researchTopicsRelations = relations(researchTopics, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [researchTopics.conversationId],
    references: [conversations.id],
  }),
  sources: many(researchSources),
  perspectives: many(researchPerspectives),
}));

export const researchSources = sqliteTable('research_sources', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => researchTopics.id),
  url: text('url').notNull(),
  title: text('title'),
  summary: text('summary'),
  credibilityScore: integer('credibility_score'), // Score from 0-100
  biasAnalysis: text('bias_analysis'), // Analysis of potential bias
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const researchSourcesRelations = relations(researchSources, ({ one }) => ({
  topic: one(researchTopics, {
    fields: [researchSources.topicId],
    references: [researchTopics.id],
  }),
}));

export const researchPerspectives = sqliteTable('research_perspectives', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => researchTopics.id),
  stance: text('stance', { enum: ['for', 'against', 'neutral'] }).notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  sourceUrl: text('source_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const researchPerspectivesRelations = relations(researchPerspectives, ({ one }) => ({
  topic: one(researchTopics, {
    fields: [researchPerspectives.topicId],
    references: [researchTopics.id],
  }),
}));

export const realTimeUpdates = sqliteTable('real_time_updates', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => researchTopics.id),
  source: text('source').notNull(), // e.g., 'News API', 'Twitter'
  content: text('content').notNull(),
  url: text('url'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const realTimeUpdatesRelations = relations(realTimeUpdates, ({ one }) => ({
  topic: one(researchTopics, {
    fields: [realTimeUpdates.topicId],
    references: [researchTopics.id],
  }),
}));

export const mindMapNodes = sqliteTable('mind_map_nodes', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => researchTopics.id),
  parentId: text('parent_id'), // Self-referencing
  label: text('label').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const mindMapNodesRelations = relations(mindMapNodes, ({ one }) => ({
  topic: one(researchTopics, {
    fields: [mindMapNodes.topicId],
    references: [researchTopics.id],
  }),
}));

export const timelineEvents = sqliteTable('timeline_events', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => researchTopics.id),
  year: integer('year').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const timelineEventsRelations = relations(timelineEvents, ({ one }) => ({
  topic: one(researchTopics, {
    fields: [timelineEvents.topicId],
    references: [researchTopics.id],
  }),
}));

export const hypotheses = sqliteTable('hypotheses', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => researchTopics.id),
  hypothesis: text('hypothesis').notNull(),
  validationApproach: text('validation_approach').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const hypothesesRelations = relations(hypotheses, ({ one }) => ({
  topic: one(researchTopics, {
    fields: [hypotheses.topicId],
    references: [researchTopics.id],
  }),
}));

export const extractedData = sqliteTable('extracted_data', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  dataType: text('data_type').notNull(), // e.g., 'table', 'chart'
  data: text('data', { mode: 'json' }).notNull(), // JSON data for the table or chart
  title: text('title'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const extractedDataRelations = relations(extractedData, ({ one }) => ({
  message: one(messages, {
    fields: [extractedData.messageId],
    references: [messages.id],
  }),
}));

export const followUpQuestions = sqliteTable('follow_up_questions', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  questions: text('questions', { mode: 'json' }).notNull(), // Array of strings
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const followUpQuestionsRelations = relations(followUpQuestions, ({ one }) => ({
  message: one(messages, {
    fields: [followUpQuestions.messageId],
    references: [messages.id],
  }),
}));

export const argumentMaps = sqliteTable('argument_maps', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  conclusion: text('conclusion').notNull(),
  premises: text('premises', { mode: 'json' }).notNull(), // Array of strings
  structure: text('structure').notNull(), // e.g., 'Deductive', 'Inductive'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const argumentMapsRelations = relations(argumentMaps, ({ one }) => ({
  message: one(messages, {
    fields: [argumentMaps.messageId],
    references: [messages.id],
  }),
}));

export const trendAnalyses = sqliteTable('trend_analyses', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => researchTopics.id),
  trend: text('trend').notNull(), // e.g., 'Increasing', 'Decreasing', 'Stable'
  forecast: text('forecast').notNull(),
  confidence: integer('confidence').notNull(), // Score from 0-100
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const trendAnalysesRelations = relations(trendAnalyses, ({ one }) => ({
  topic: one(researchTopics, {
    fields: [trendAnalyses.topicId],
    references: [researchTopics.id],
  }),
}));

export const gitCommandSuggestions = sqliteTable('git_command_suggestions', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  scenario: text('scenario').notNull(),
  command: text('command').notNull(),
  explanation: text('explanation').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const gitCommandSuggestionsRelations = relations(gitCommandSuggestions, ({ one }) => ({
  message: one(messages, {
    fields: [gitCommandSuggestions.messageId],
    references: [messages.id],
  }),
}));

export const literatureReviews = sqliteTable('literature_reviews', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => researchTopics.id),
  paperTitle: text('paper_title').notNull(),
  authors: text('authors', { mode: 'json' }).notNull(), // Array of strings
  publicationYear: integer('publication_year'),
  summary: text('summary').notNull(),
  sourceUrl: text('source_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const literatureReviewsRelations = relations(literatureReviews, ({ one }) => ({
  topic: one(researchTopics, {
    fields: [literatureReviews.topicId],
    references: [researchTopics.id],
  }),
}));

export const codeGolfSuggestions = sqliteTable('code_golf_suggestions', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  originalCode: text('original_code').notNull(),
  golfedCode: text('golfed_code').notNull(),
  characterSavings: integer('character_savings').notNull(),
  explanation: text('explanation').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const codeGolfSuggestionsRelations = relations(codeGolfSuggestions, ({ one }) => ({
  message: one(messages, {
    fields: [codeGolfSuggestions.messageId],
    references: [messages.id],
  }),
}));

export const ethicalAnalyses = sqliteTable('ethical_analyses', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => researchTopics.id),
  potentialBiases: text('potential_biases', { mode: 'json' }).notNull(), // Array of strings
  ethicalConcerns: text('ethical_concerns', { mode: 'json' }).notNull(), // Array of strings
  mitigationStrategies: text('mitigation_strategies', { mode: 'json' }).notNull(), // Array of strings
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const ethicalAnalysesRelations = relations(ethicalAnalyses, ({ one }) => ({
  topic: one(researchTopics, {
    fields: [ethicalAnalyses.topicId],
    references: [researchTopics.id],
  }),
}));

export const dataStructureSuggestions = sqliteTable('data_structure_suggestions', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  problemDescription: text('problem_description').notNull(),
  suggestedStructure: text('suggested_structure').notNull(), // e.g., 'Hash Map', 'Linked List'
  pros: text('pros', { mode: 'json' }).notNull(), // Array of strings
  cons: text('cons', { mode: 'json' }).notNull(), // Array of strings
  codeExample: text('code_example').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const dataStructureSuggestionsRelations = relations(dataStructureSuggestions, ({ one }) => ({
  message: one(messages, {
    fields: [dataStructureSuggestions.messageId],
    references: [messages.id],
  }),
}));

export const comparativeAnalyses = sqliteTable('comparative_analyses', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  items: text('items', { mode: 'json' }).notNull(),
  features: text('features', { mode: 'json' }).notNull(),
  summary: text('summary').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const comparativeAnalysesRelations = relations(comparativeAnalyses, ({ one }) => ({
  message: one(messages, {
    fields: [comparativeAnalyses.messageId],
    references: [messages.id],
  }),
}));

export const factChecks = sqliteTable('fact_checks', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  claim: text('claim').notNull(),
  verdict: text('verdict').notNull(),
  confidence: integer('confidence').notNull(),
  evidence: text('evidence', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const factChecksRelations = relations(factChecks, ({ one }) => ({
  message: one(messages, {
    fields: [factChecks.messageId],
    references: [messages.id],
  }),
}));

export const outlines = sqliteTable('outlines', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  topic: text('topic').notNull(),
  outline: text('outline', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const outlinesRelations = relations(outlines, ({ one }) => ({
  message: one(messages, {
    fields: [outlines.messageId],
    references: [messages.id],
  }),
}));

export const citations = sqliteTable('citations', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  text: text('text').notNull(),
  style: text('style').notNull(),
  citations: text('citations', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const citationsRelations = relations(citations, ({ one }) => ({
  message: one(messages, {
    fields: [citations.messageId],
    references: [messages.id],
  }),
}));

export const privacyReviews = sqliteTable('privacy_reviews', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  content: text('content').notNull(),
  findings: text('findings', { mode: 'json' }).notNull(),
  recommendations: text('recommendations', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const privacyReviewsRelations = relations(privacyReviews, ({ one }) => ({
  message: one(messages, {
    fields: [privacyReviews.messageId],
    references: [messages.id],
  }),
}));

export const riskRegisters = sqliteTable('risk_registers', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  context: text('context').notNull(),
  risks: text('risks', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const riskRegistersRelations = relations(riskRegisters, ({ one }) => ({
  message: one(messages, {
    fields: [riskRegisters.messageId],
    references: [messages.id],
  }),
}));

export const studyPlans = sqliteTable('study_plans', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  goal: text('goal').notNull(),
  durationDays: integer('duration_days').notNull(),
  plan: text('plan', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const studyPlansRelations = relations(studyPlans, ({ one }) => ({
  message: one(messages, {
    fields: [studyPlans.messageId],
    references: [messages.id],
  }),
}));
