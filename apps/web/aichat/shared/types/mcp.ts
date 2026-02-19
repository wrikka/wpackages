export interface MCPServer {
  id: string;
  organizationId: string;
  name: string;
  endpoint: string;
  transport: 'stdio' | 'sse';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  enabled: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MCPTool {
  id: string;
  mcpServerId: string;
  name: string;
  description?: string;
  inputSchema?: Record<string, any>;
  createdAt: Date | string;
}

export interface MCPAgentTool {
  agentId: string;
  mcpToolId: string;
}
