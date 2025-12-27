import { ref, onMounted, onUnmounted } from 'vue';
import type { ViteConfig, PackageInfo } from '~/app/types/vite';

export const useViteServer = () => {
  const viteConfig = ref<ViteConfig | null>(null);
  const packageInfo = ref<PackageInfo | null>(null);
  const isConnected = ref(false);

  let ws: WebSocket;

  const connect = () => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      isConnected.value = true;
      ws.send(JSON.stringify({ type: 'wdevtools:client-ready' }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'wdevtools:vite-config') {
        viteConfig.value = message.config;
      }
      if (message.type === 'wdevtools:package-info') {
        packageInfo.value = message.packageJson;
      }
    };

    ws.onclose = () => {
      isConnected.value = false;
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      isConnected.value = false;
    };
  };

  onMounted(() => {
    if (typeof window !== 'undefined') {
      connect();
    }
  });

  onUnmounted(() => {
    if (ws) {
      ws.close();
    }
  });

  return { viteConfig, packageInfo, isConnected };
};
