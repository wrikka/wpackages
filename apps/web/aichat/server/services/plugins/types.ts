import type { JSONSchema } from 'openai/lib/jsonschema.mjs';

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: JSONSchema;
  };
}

export interface Plugin {
  name: string;
  description: string;
  tools: Tool[];
  execute: (toolName: string, args: any) => Promise<any>;
}
