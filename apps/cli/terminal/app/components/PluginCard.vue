<script setup lang="ts">

import type { PluginManifest } from '~/composables/usePluginMarketplace'

defineProps<{
  plugin: PluginManifest
  installed?: boolean
  enabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  install: [pluginId: string]
  uninstall: [pluginId: string]
  enable: [pluginId: string]
  disable: [pluginId: string]
}>()

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

</script>

<template>

  <div class="plugin-card">
    <div v-if="plugin.icon_url" class="plugin-icon">
      <img :src="plugin.icon_url" :alt="plugin.name" />
    </div>
    <div class="plugin-content">
      <div class="plugin-header">
        <h4>{{ plugin.name }}</h4>
        <span class="plugin-version">{{ plugin.version }}</span>
      </div>
      <p class="plugin-description">{{ plugin.description }}</p>
      <div class="plugin-meta">
        <span class="plugin-author">{{ plugin.author }}</span>
        <span class="plugin-category">{{ plugin.category }}</span>
      </div>
      <div class="plugin-stats">
        <span class="stat">
          <Icon name="download" size="14" />
          {{ formatNumber(plugin.downloads) }}
        </span>
        <span class="stat">
          <Icon name="star" size="14" />
          {{ plugin.rating.toFixed(1) }}
        </span>
        <span class="stat">
          <Icon name="users" size="14" />
          {{ plugin.rating_count }}
        </span>
      </div>
      <div v-if="plugin.tags.length > 0" class="plugin-tags">
        <span v-for="tag in plugin.tags.slice(0, 3)" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>
    </div>
    <div class="plugin-actions">
      <button
        v-if="!installed"
        class="btn btn-primary"
        @click="$emit('install', plugin.id)"
        :disabled="loading"
      >
        <Icon v-if="loading" name="loader-2" size="14" class="spin" />
        <Icon v-else name="download" size="14" />
        Install
      </button>
      <template v-else>
        <button
          v-if="!enabled"
          class="btn btn-secondary"
          @click="$emit('enable', plugin.id)"
        >
          <Icon name="power" size="14" />
          Enable
        </button>
        <button
          v-else
          class="btn btn-secondary"
          @click="$emit('disable', plugin.id)"
        >
          <Icon name="power-off" size="14" />
          Disable
        </button>
        <button
          class="btn btn-danger"
          @click="$emit('uninstall', plugin.id)"
        >
          <Icon name="trash-2" size="14" />
          Uninstall
        </button>
      
</template>

<style scoped>

.plugin-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s;
}

.plugin-card:hover {
  border-color: var(--accent-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.plugin-icon {
  width: 100%;
  height: 120px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.plugin-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plugin-content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.plugin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.plugin-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--fg-primary);
}

.plugin-version {
  font-size: 0.75rem;
  color: var(--fg-secondary);
  background: var(--bg-primary);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.plugin-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--fg-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plugin-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--fg-secondary);
}

.plugin-author::before {
  content: 'by ';
}

.plugin-category {
  color: var(--accent-color);
}

.plugin-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--fg-secondary);
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.plugin-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: auto;
}

.tag {
  font-size: 0.625rem;
  color: var(--fg-secondary);
  background: var(--bg-primary);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.plugin-actions {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 0.5rem;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--fg-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-secondary);
}

.btn-danger {
  background: transparent;
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}

.btn-danger:hover:not(:disabled) {
  background: var(--danger-color);
  color: white;
}

.spin {
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

</style>