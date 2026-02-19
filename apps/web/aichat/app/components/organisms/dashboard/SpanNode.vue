<script setup lang="ts">

import { ref } from 'vue';
import type { SpanInfo } from '~/utils/trace-renderer';

defineProps<{
  span: SpanInfo;
}>();
const toggle = ref(true);

</script>

<template>

  <li class="span-node">
    <div class="span-details" @click="toggle = !toggle">
      <span class="status">{{ span.status === 'ok' ? '✅' : '❌' }}</span>
      <strong class="name">{{ span.name }}</strong>
      <span class="duration">({{ span.durationMs }}ms)</span>
    </div>
    <ul v-if="toggle && span.children.length > 0" class="children">
      <DashboardSpanNode v-for="child in span.children" :key="child.spanId" :span="child" />
    </ul>
    <div v-if="toggle" class="attributes">
      <pre>{{ span.attributes }}</pre>
    </div>
  </li>

</template>

<style scoped>

.span-node {
  list-style-type: none;
  margin-left: 20px;
  padding-left: 10px;
  border-left: 1px solid #ccc;
}
.span-details {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}
.span-details:hover {
  background-color: #f0f0f0;
}
.name {
  font-weight: bold;
}
.duration {
  color: #666;
  margin-left: 8px;
}
.status {
  margin-right: 8px;
}
.attributes {
  background-color: #fafafa;
  border: 1px solid #eee;
  padding: 10px;
  margin-top: 5px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

</style>