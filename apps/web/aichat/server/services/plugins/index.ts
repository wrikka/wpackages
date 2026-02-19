import type { Plugin, Tool } from './types';

import { weatherPlugin } from './weather';

const allPlugins: Plugin[] = [weatherPlugin];

const pluginRegistry = new Map<string, Plugin>();

function initializePlugins() {
  for (const plugin of allPlugins) {
    pluginRegistry.set(plugin.name, plugin);
  }
}

initializePlugins();

export function getAvailableTools(): Tool[] {
  const tools: Tool[] = [];
  for (const plugin of pluginRegistry.values()) {
    tools.push(...plugin.tools);
  }
  return tools;
}

export async function executeTool(toolName: string, args: any): Promise<any> {
  for (const plugin of pluginRegistry.values()) {
    const tool = plugin.tools.find(t => t.function.name === toolName);
    if (tool) {
      return plugin.execute(toolName, args);
    }
  }
  throw new Error(`Tool "${toolName}" not found.`);
}
