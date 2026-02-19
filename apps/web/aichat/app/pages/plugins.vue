<script setup lang="ts">

import { computed, onMounted, ref, watch } from 'vue';
import { usePluginsStore, type InstalledPlugin, type PluginManifest } from '~/stores/plugins';

const pluginsStore = usePluginsStore();

const isInstallModalOpen = ref(false);
const availablePermissions = ['ui:chatInput.toolbar', 'ui:sidebar_section', 'ui:message_actions', 'chat:write_draft'] as const;
const availableExtensionPoints = ['ui:chatInput.toolbar', 'ui:sidebar_section', 'ui:message_actions', 'chat:beforeSend'] as const;

const newInstallForm = () => ({
  id: '',
  name: '',
  version: '0.1.0',
  description: '',
  entry: '',
  permissions: {} as Record<typeof availablePermissions[number], boolean>,
  extensionPoints: {} as Record<typeof availableExtensionPoints[number], boolean>,
});

const installForm = ref(newInstallForm());

const generatedManifestJson = computed(() => {
  const manifest: any = {};
  if (installForm.value.id) manifest.id = installForm.value.id;
  if (installForm.value.name) manifest.name = installForm.value.name;
  if (installForm.value.version) manifest.version = installForm.value.version;
  if (installForm.value.description) manifest.description = installForm.value.description;
  if (installForm.value.entry) manifest.entry = installForm.value.entry;

  const permissions = Object.entries(installForm.value.permissions)
    .filter(([, v]) => v)
    .map(([k]) => k);
  if (permissions.length > 0) manifest.permissions = permissions;

  const extensionPoints = Object.entries(installForm.value.extensionPoints)
    .filter(([, v]) => v)
    .map(([k]) => k);
  if (extensionPoints.length > 0) manifest.extensionPoints = extensionPoints;

  return JSON.stringify(manifest, null, 2);
});

function setPreset(preset: 'hello-toolbar' | 'sidebar-hello' | 'message-action-hello' | 'before-send-uppercase') {
  if (preset === 'hello-toolbar') {
    installForm.value.id = 'com.wai.hello'
    installForm.value.name = 'Hello Plugin'
    installForm.value.version = '0.1.0'
    installForm.value.description = 'Example plugin'
    installForm.value.entry = '/plugins/hello/index.html'

    installForm.value.permissions = {
      'ui:chatInput.toolbar': true,
      'ui:sidebar_section': false,
      'ui:message_actions': false,
      'chat:write_draft': true,
    }
    installForm.value.extensionPoints = {
      'ui:chatInput.toolbar': true,
      'ui:sidebar_section': false,
      'ui:message_actions': false,
      'chat:beforeSend': false,
    }
    return
  }

  if (preset === 'sidebar-hello') {
    installForm.value.id = 'com.wai.sidebar-hello'
    installForm.value.name = 'Sidebar Hello Plugin'
    installForm.value.version = '0.1.0'
    installForm.value.description = 'Example sidebar plugin'
    installForm.value.entry = '/plugins/sidebar-hello/index.html'

    installForm.value.permissions = {
      'ui:chatInput.toolbar': false,
      'ui:sidebar_section': true,
      'ui:message_actions': false,
      'chat:write_draft': false,
    }
    installForm.value.extensionPoints = {
      'ui:chatInput.toolbar': false,
      'ui:sidebar_section': true,
      'ui:message_actions': false,
      'chat:beforeSend': false,
    }
    return
  }

  if (preset === 'message-action-hello') {
    installForm.value.id = 'com.wai.message-action-hello'
    installForm.value.name = 'Message Action Hello'
    installForm.value.version = '0.1.0'
    installForm.value.description = 'Example message action plugin'
    installForm.value.entry = '/plugins/message-action-hello/index.html'

    installForm.value.permissions = {
      'ui:chatInput.toolbar': false,
      'ui:sidebar_section': false,
      'ui:message_actions': true,
      'chat:write_draft': false,
    }
    installForm.value.extensionPoints = {
      'ui:chatInput.toolbar': false,
      'ui:sidebar_section': false,
      'ui:message_actions': true,
      'chat:beforeSend': false,
    }
    return
  }

  installForm.value.id = 'com.wai.before-send-uppercase'
  installForm.value.name = 'BeforeSend Uppercase'
  installForm.value.version = '0.1.0'
  installForm.value.description = 'Uppercase draft before send'
  installForm.value.entry = '/plugins/before-send-uppercase/index.html'

  installForm.value.permissions = {
    'ui:chatInput.toolbar': false,
    'ui:sidebar_section': false,
    'ui:message_actions': false,
    'chat:write_draft': true,
  }
  installForm.value.extensionPoints = {
    'ui:chatInput.toolbar': false,
    'ui:sidebar_section': false,
    'ui:message_actions': false,
    'chat:beforeSend': true,
  }
}

const isConfigModalOpen = ref(false);
const selectedPlugin = ref<InstalledPlugin | null>(null);
const configForm = ref({ configJson: '{}' });

onMounted(() => {
  pluginsStore.fetchPlugins();
});

async function onInstall() {
  const manifest = JSON.parse(generatedManifestJson.value) as PluginManifest;
  if (!manifest.entry) {
    throw createError({ statusCode: 400, statusMessage: 'Entry URL is required' })
  }
  await pluginsStore.installPlugin(manifest);
  isInstallModalOpen.value = false;
}

async function onToggleEnabled(id: string, enabled: boolean) {
  await pluginsStore.updatePlugin(id, { enabled });
}

function openConfig(p: InstalledPlugin) {
  selectedPlugin.value = p;
  configForm.value.configJson = JSON.stringify(p.config ?? {}, null, 2);
  isConfigModalOpen.value = true;
}

async function onSaveConfig() {
  if (!selectedPlugin.value) return;
  const config = JSON.parse(configForm.value.configJson) as Record<string, unknown>;
  await pluginsStore.updatePlugin(selectedPlugin.value.id, { config });
  isConfigModalOpen.value = false;
}

async function onUninstall(p: InstalledPlugin) {
  if (!confirm(`Uninstall ${p.name}?`)) return;
  await pluginsStore.uninstallPlugin(p.id);
}

watch(isInstallModalOpen, (isOpen) => {
  if (isOpen) {
    installForm.value = newInstallForm();
    setPreset('hello-toolbar')
  }
});

</script>

<template>

  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Plugins</h1>
      <div class="flex items-center gap-2">
        <UButton color="gray" variant="soft" @click="pluginsStore.fetchPlugins" :loading="pluginsStore.isLoading">
          Refresh
        </UButton>
        <UButton @click="isInstallModalOpen = true">Install</UButton>
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="font-semibold">Installed</div>
      
</template>