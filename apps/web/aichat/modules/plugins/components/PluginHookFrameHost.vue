<script setup lang="ts">

import { onMounted, onUnmounted, ref } from 'vue';

type PluginReadyMessage = { type: 'plugin:ready' };
type PluginResponseMessage = {
  type: 'plugin:response';
  requestId: string;
  ok: boolean;
  result?: any;
  error?: string;
};
type IncomingMessage = PluginReadyMessage | PluginResponseMessage;
type InitMessage = {
  type: 'host:init';
  payload: {
    pluginId: string;
    context?: any;
  };
};
type InvokeMessage = {
  type: 'host:invoke';
  requestId: string;
  method: string;
  payload: any;
};
const props = withDefaults(
  defineProps<{
    pluginId: string;
    src: string;
    title?: string;
    context?: any;
    timeoutMs?: number;
  }>(),
  {
    title: 'Plugin Hook',
    timeoutMs: 1500,
  },
);
const iframeRef = ref<HTMLIFrameElement | null>(null);
const pending = new Map<string, { resolve: (v: any) => void; reject: (e: any) => void; timer: any }>();
function postToPlugin(message: InitMessage | InvokeMessage) {
  const win = iframeRef.value?.contentWindow;
  if (!win) return;
  win.postMessage(message, '*');
}
function onMessage(event: MessageEvent) {
  const win = iframeRef.value?.contentWindow;
  if (!win || event.source !== win) return;
  try {
    const expectedOrigin = new URL(props.src, window.location.origin).origin;
    if (event.origin !== expectedOrigin) {
      return;
    }
  } catch {
    return;
  }
  const data = event.data as IncomingMessage;
  if (!data || typeof data !== 'object') return;
  if (data.type === 'plugin:ready') {
    postToPlugin({
      type: 'host:init',
      payload: { pluginId: props.pluginId, context: props.context },
    });
    return;
  }
  if (data.type === 'plugin:response') {
    const entry = pending.get(data.requestId);
    if (!entry) return;
    clearTimeout(entry.timer);
    pending.delete(data.requestId);
    if (data.ok) {
      entry.resolve(data.result);
    } else {
      entry.reject(new Error(data.error || 'Plugin error'));
    }
  }
}
function randomId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}
async function invoke(method: string, payload: any) {
  const requestId = randomId();
  return await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(requestId);
      reject(new Error('Plugin timeout'));
    }, props.timeoutMs);
    pending.set(requestId, { resolve, reject, timer });
    postToPlugin({
      type: 'host:invoke',
      requestId,
      method,
      payload,
    });
  });
}
defineExpose({
  invoke,
});
onMounted(() => {
  window.addEventListener('message', onMessage);
});
onUnmounted(() => {
  window.removeEventListener('message', onMessage);
  for (const [, entry] of pending) {
    clearTimeout(entry.timer);
  }
  pending.clear();
});

</script>

<template>

  <iframe
    ref="iframeRef"
    :src="src"
    sandbox="allow-scripts"
    class="hidden"
    :title="title"
  />

</template>