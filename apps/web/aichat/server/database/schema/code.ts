import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { messages } from './core';

export const codeSnippets = sqliteTable('code_snippets', {
  id: text('id').primaryKey(),
  messageId: text('message_id').references(() => messages.id),
  language: text('language').notNull(),
  code: text('code').notNull(),
  refactoredCode: text('refactored_code'),
  explanation: text('explanation'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const codeSnippetsRelations = relations(codeSnippets, ({ one, many }) => ({
  message: one(messages, {
    fields: [codeSnippets.messageId],
    references: [messages.id],
  }),
  testCases: many(testCases),
}));

export const testCases = sqliteTable('test_cases', {
  id: text('id').primaryKey(),
  snippetId: text('snippet_id').notNull().references(() => codeSnippets.id),
  framework: text('framework').notNull(), // e.g., 'jest', 'vitest'
  code: text('code').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const testCasesRelations = relations(testCases, ({ one }) => ({
  snippet: one(codeSnippets, {
    fields: [testCases.snippetId],
    references: [codeSnippets.id],
  }),
}));

export const debuggingSessions = sqliteTable('debugging_sessions', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  errorMessage: text('error_message').notNull(),
  stackTrace: text('stack_trace'),
  analysis: text('analysis').notNull(), // AI's analysis
  suggestedFix: text('suggested_fix').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const debuggingSessionsRelations = relations(debuggingSessions, ({ one }) => ({
  message: one(messages, {
    fields: [debuggingSessions.messageId],
    references: [messages.id],
  }),
}));

export const dependencySuggestions = sqliteTable('dependency_suggestions', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  packageName: text('package_name').notNull(),
  currentVersion: text('current_version'),
  latestVersion: text('latest_version'),
  suggestion: text('suggestion').notNull(), // e.g., 'Update available', 'Vulnerability found', 'Consider alternative'
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const dependencySuggestionsRelations = relations(dependencySuggestions, ({ one }) => ({
  message: one(messages, {
    fields: [dependencySuggestions.messageId],
    references: [messages.id],
  }),
}));

export const generatedDocs = sqliteTable('generated_docs', {
  id: text('id').primaryKey(),
  snippetId: text('snippet_id').notNull().references(() => codeSnippets.id),
  format: text('format').notNull(), // e.g., 'markdown', 'jsdoc'
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const generatedDocsRelations = relations(generatedDocs, ({ one }) => ({
  snippet: one(codeSnippets, {
    fields: [generatedDocs.snippetId],
    references: [codeSnippets.id],
  }),
}));

export const designPatternSuggestions = sqliteTable('design_pattern_suggestions', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  problemDescription: text('problem_description').notNull(),
  patternName: text('pattern_name').notNull(), // e.g., 'Singleton', 'Factory'
  description: text('description').notNull(),
  exampleCode: text('example_code'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const designPatternSuggestionsRelations = relations(designPatternSuggestions, ({ one }) => ({
  message: one(messages, {
    fields: [designPatternSuggestions.messageId],
    references: [messages.id],
  }),
}));

export const performanceReports = sqliteTable('performance_reports', {
  id: text('id').primaryKey(),
  snippetId: text('snippet_id').notNull().references(() => codeSnippets.id),
  bottleneck: text('bottleneck').notNull(), // e.g., 'Inefficient Loop', 'High Memory Usage'
  suggestion: text('suggestion').notNull(),
  optimizedCode: text('optimized_code'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const performanceReportsRelations = relations(performanceReports, ({ one }) => ({
  snippet: one(codeSnippets, {
    fields: [performanceReports.snippetId],
    references: [codeSnippets.id],
  }),
}));

export const codeTranslations = sqliteTable('code_translations', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  sourceLanguage: text('source_language').notNull(),
  targetLanguage: text('target_language').notNull(),
  sourceCode: text('source_code').notNull(),
  translatedCode: text('translated_code').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const codeTranslationsRelations = relations(codeTranslations, ({ one }) => ({
  message: one(messages, {
    fields: [codeTranslations.messageId],
    references: [messages.id],
  }),
}));

export const apiIntegrations = sqliteTable('api_integrations', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  apiName: text('api_name').notNull(),
  clientCode: text('client_code').notNull(),
  usageExample: text('usage_example').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const apiIntegrationsRelations = relations(apiIntegrations, ({ one }) => ({
  message: one(messages, {
    fields: [apiIntegrations.messageId],
    references: [messages.id],
  }),
}));

export const regexSuggestions = sqliteTable('regex_suggestions', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  description: text('description').notNull(),
  regex: text('regex').notNull(),
  explanation: text('explanation').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const regexSuggestionsRelations = relations(regexSuggestions, ({ one }) => ({
  message: one(messages, {
    fields: [regexSuggestions.messageId],
    references: [messages.id],
  }),
}));

export const securityVulnerabilities = sqliteTable('security_vulnerabilities', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  vulnerabilityType: text('vulnerability_type').notNull(),
  severity: text('severity').notNull(),
  description: text('description').notNull(),
  remediation: text('remediation').notNull(),
  codeSnippet: text('code_snippet').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const securityVulnerabilitiesRelations = relations(securityVulnerabilities, ({ one }) => ({
  message: one(messages, {
    fields: [securityVulnerabilities.messageId],
    references: [messages.id],
  }),
}));

export const codeExplanations = sqliteTable('code_explanations', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  language: text('language').notNull(),
  code: text('code').notNull(),
  explanation: text('explanation').notNull(),
  keyPoints: text('key_points', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const codeExplanationsRelations = relations(codeExplanations, ({ one }) => ({
  message: one(messages, {
    fields: [codeExplanations.messageId],
    references: [messages.id],
  }),
}));

export const commitMessageSuggestions = sqliteTable('commit_message_suggestions', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  diff: text('diff').notNull(),
  suggestions: text('suggestions', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const commitMessageSuggestionsRelations = relations(commitMessageSuggestions, ({ one }) => ({
  message: one(messages, {
    fields: [commitMessageSuggestions.messageId],
    references: [messages.id],
  }),
}));

export const dockerfileGenerations = sqliteTable('dockerfile_generations', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  appType: text('app_type').notNull(),
  requirements: text('requirements', { mode: 'json' }).notNull(),
  dockerfile: text('dockerfile').notNull(),
  notes: text('notes', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const dockerfileGenerationsRelations = relations(dockerfileGenerations, ({ one }) => ({
  message: one(messages, {
    fields: [dockerfileGenerations.messageId],
    references: [messages.id],
  }),
}));

export const sqlReviews = sqliteTable('sql_reviews', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  sql: text('sql').notNull(),
  issues: text('issues', { mode: 'json' }).notNull(),
  improvedSql: text('improved_sql'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const sqlReviewsRelations = relations(sqlReviews, ({ one }) => ({
  message: one(messages, {
    fields: [sqlReviews.messageId],
    references: [messages.id],
  }),
}));

export const testFixSuggestions = sqliteTable('test_fix_suggestions', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  failingOutput: text('failing_output').notNull(),
  suspectedCause: text('suspected_cause').notNull(),
  suggestedFixes: text('suggested_fixes', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const testFixSuggestionsRelations = relations(testFixSuggestions, ({ one }) => ({
  message: one(messages, {
    fields: [testFixSuggestions.messageId],
    references: [messages.id],
  }),
}));

export const logAnalyses = sqliteTable('log_analyses', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  logs: text('logs').notNull(),
  summary: text('summary').notNull(),
  rootCauses: text('root_causes', { mode: 'json' }).notNull(),
  actions: text('actions', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const logAnalysesRelations = relations(logAnalyses, ({ one }) => ({
  message: one(messages, {
    fields: [logAnalyses.messageId],
    references: [messages.id],
  }),
}));
