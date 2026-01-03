import fs from 'node:fs';
import { resolve } from 'node:path';
import type { ViteDevServer } from 'vite';

export const handleWebSocket = (server: ViteDevServer) => {
  server.ws.on('connection', (ws) => {
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === 'wdevtools:client-ready') {
        server.ws.send('wdevtools:vite-config', { config: server.config });
        const packageJsonPath = resolve(server.config.root, 'package.json');
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          server.ws.send('wdevtools:package-info', { packageJson });
        } catch (e) {
          console.error('wdevtools: could not find or parse package.json', e);
        }
      }

      if (message.type === 'wdevtools:get-module-graph') {
        const moduleGraph = server.moduleGraph.getModulesByFile(message.file);
        const graph = {
          nodes: Array.from(moduleGraph?.values() ?? []).map(node => ({ id: node.url, label: node.url })),
          edges: Array.from(moduleGraph?.values() ?? []).flatMap(node => 
            Array.from(node.importedModules).map(imported => ({ from: node.url, to: imported.url }))
          ),
        };
        server.ws.send('wdevtools:module-graph', { graph });
      }
    });
  });
};
