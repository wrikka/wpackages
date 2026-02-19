<script setup lang="ts">

import { onMounted, onUnmounted, ref } from 'vue';

type PluginCallMessage = {
  type: 'plugin:call';
  method: 'setDraft' | 'toast';
  params: any;
};
type PluginReadyMessage = {
  type: 'plugin:ready';
};
type IncomingMessage = PluginCallMessage | PluginReadyMessage;
type InitMessage = {
  type: 'host:init';
  payload: {
    pluginId: string;
    context?: any;
  };
};
const props = withDefaults(
  defineProps<{
    pluginId: string;
    src: string;
    title?: string;
    width?: number;
    height?: number;
    allowedMethods?: Array<'setDraft' | 'toast'>;
    context?: any;
  }>(),
  {
    title: 'Plugin',
    width: 36,
    height: 36,
    allowedMethods: () => ['toast'],
  },
);
const emit = defineEmits<{
  setDraft: [text: string];
  toast: [payload: { title: string; description?: string; color?: string }];
}>();
const iframeRef = ref<HTMLIFrameElement | null>(null);
function postToPlugin(message: InitMessage) {
  const win = iframeRef.value?.contentWindow;
  if (!win) return;
  win.postMessage(message, '*');
}
function onMessage(event: MessageEvent) {
  const win = iframeRef.value?.contentWindow;
  if (!win || event.source !== win) return;
  // v1 hardening: only accept messages from the iframe origin.
  // If src is relative, browsers set event.origin to this app's origin.
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
  if (data.type === 'plugin:call') {
    if (!props.allowedMethods.includes(data.method)) {
      return;
    }
    if (data.method === 'setDraft') {
      const text = typeof data.params?.text === 'string' ? data.params.text : '';
      emit('setDraft', text);
      return;
    }
    if (data.method === 'toast') {
      const title = typeof data.params?.title === 'string' ? data.params.title : 'Plugin';
      const description = typeof data.params?.description === 'string' ? data.params.description : undefined;
      const color = typeof data.params?.color === 'string' ? data.params.color : 'primary';
      emit('toast', { title, description, color });
      return;
    }
  }
}
onMounted(() => {
  window.addEventListener('message', onMessage);
});
onUnmounted(() => {
  window.removeEventListener('message', onMessage);
});

</script>

<template>

  <iframe
    ref="iframeRef"
    :src="src"
    sandbox="allow-scripts"
    class="border-0"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      display: 'block',
      overflow: 'hidden',
    }"
    :title="title"
  />

</template>