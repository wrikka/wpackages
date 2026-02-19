import { z } from 'zod';

export const mcpServerSchema = z.object({
  name: z.string().min(1).max(255),
  endpoint: z.string().url(),
  transport: z.enum(['stdio', 'sse']).default('stdio'),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string(), z.any()).optional(),
});

export const workflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  definition: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      type: z.string(),
      data: z.any(),
    })),
    edges: z.array(z.object({
      from: z.string(),
      to: z.string(),
      condition: z.any().optional(),
    })),
  }),
  isActive: z.boolean().default(true),
});

export const promptTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().optional(),
  promptText: z.string().min(1),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

export const chatTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().min(1),
  systemPrompt: z.string().min(1),
  model: z.string().default('gpt-3.5-turbo'),
  icon: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const rateLimitSchema = z.object({
  type: z.enum(['messages_per_hour', 'tokens_per_day', 'api_calls_per_minute']),
  limit: z.number().min(1),
  window: z.number().min(1),
  userId: z.string().optional(),
});

export const knowledgeGraphSchema = z.object({
  knowledgeBaseId: z.string().min(1),
  nodes: z.array(z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    properties: z.record(z.string(), z.any()).optional(),
    embedding: z.array(z.number()).optional(),
  })),
  edges: z.array(z.object({
    id: z.string(),
    sourceNodeId: z.string(),
    targetNodeId: z.string(),
    relation: z.string(),
    weight: z.number().default(1),
  })),
});

export const codeExecutionSchema = z.object({
  chatSessionId: z.string().optional(),
  messageId: z.string().optional(),
  code: z.string().min(1),
  language: z.enum(['python', 'javascript', 'typescript']),
});

export const whiteboardSchema = z.object({
  name: z.string().min(1).max(255),
  canvasData: z.any(),
  chatSessionId: z.string().optional(),
});

export const webSearchSchema = z.object({
  chatSessionId: z.string(),
  query: z.string().min(1),
  messageId: z.string().optional(),
  results: z.any(),
  citations: z.array(z.any()).default([]),
});

export const multimodalAttachmentSchema = z.object({
  messageId: z.string(),
  type: z.enum(['image', 'audio', 'video']),
  mimeType: z.string(),
  filePath: z.string(),
  analysis: z.any().optional(),
});

export const memorySchema = z.object({
  agentId: z.string().optional(),
  key: z.string().min(1),
  value: z.string(),
});

export const scheduledAgentRunSchema = z.object({
  scheduledPromptId: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
  input: z.any().optional(),
  output: z.any().optional(),
  error: z.string().optional(),
});

export const pluginInstallSchema = z.object({
  pluginId: z.string().min(1),
  config: z.record(z.string(), z.any()).default({}),
});

export const chatBranchSchema = z.object({
  chatSessionId: z.string(),
  name: z.string().min(1).max(255),
  branchPointMessageId: z.string(),
});

export const imageGenerationSchema = z.object({
  prompt: z.string().min(1).max(4000),
  model: z.string().default('dall-e-3'),
  size: z.enum(['256x256', '512x512', '1024x1024']).default('1024x1024'),
  quality: z.enum(['standard', 'hd']).default('standard'),
  n: z.number().min(1).max(10).default(1),
});

export const exportFormatSchema = z.object({
  format: z.enum(['json', 'markdown', 'pdf']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  agentId: z.string().optional(),
  category: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type McpServerInput = z.infer<typeof mcpServerSchema>;
export type WorkflowInput = z.infer<typeof workflowSchema>;
export type PromptTemplateInput = z.infer<typeof promptTemplateSchema>;
export type ChatTemplateInput = z.infer<typeof chatTemplateSchema>;
export type RateLimitInput = z.infer<typeof rateLimitSchema>;
export type KnowledgeGraphInput = z.infer<typeof knowledgeGraphSchema>;
export type CodeExecutionInput = z.infer<typeof codeExecutionSchema>;
export type WhiteboardInput = z.infer<typeof whiteboardSchema>;
export type WebSearchInput = z.infer<typeof webSearchSchema>;
export type MultimodalAttachmentInput = z.infer<typeof multimodalAttachmentSchema>;
export type MemoryInput = z.infer<typeof memorySchema>;
export type ScheduledAgentRunInput = z.infer<typeof scheduledAgentRunSchema>;
export type PluginInstallInput = z.infer<typeof pluginInstallSchema>;
export type ChatBranchInput = z.infer<typeof chatBranchSchema>;
export type ImageGenerationInput = z.infer<typeof imageGenerationSchema>;
export type ExportFormatInput = z.infer<typeof exportFormatSchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
