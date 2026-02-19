import { defaultModes, type ModeConfig } from '#shared/config/modes';
import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';

export const useModesStore = defineStore('modes', () => {
  // Persist modes configuration in localStorage
  const modes = useStorage<ModeConfig[]>('chat-modes-config', defaultModes);

  // Ensure any new default modes are added to existing user configurations
  const syncWithDefaults = () => {
    const userModeIds = new Set(modes.value.map(m => m.id));
    for (const defaultMode of defaultModes) {
      if (!userModeIds.has(defaultMode.id)) {
        modes.value.push(defaultMode);
      }
    }
    modes.value = modes.value.filter((userMode) => {
      if (userMode.id.startsWith('custom:')) {
        return true;
      }
      return defaultModes.some(defaultMode => defaultMode.id === userMode.id);
    });
  };

  // Initial sync
  syncWithDefaults();

  const enabledModes = computed(() => {
    return modes.value.filter(mode => mode.enabled);
  });

  function updateMode(modeId: string, updates: Partial<ModeConfig>) {
    const modeIndex = modes.value.findIndex(m => m.id === modeId);
    if (modeIndex !== -1) {
      modes.value[modeIndex] = { ...modes.value[modeIndex], ...updates };
    }
  }

  function setAllModes(newModes: ModeConfig[]) {
    modes.value = newModes;
  }

  function createCustomMode(
    input: {
      label: string;
      description: string;
      icon: string;
      baseMode?: ModeConfig['baseMode'];
      defaultPrompt?: string;
    },
  ) {
    const id = `custom:${crypto.randomUUID()}`;
    modes.value.push({
      id,
      label: input.label,
      description: input.description,
      icon: input.icon,
      enabled: true,
      baseMode: input.baseMode,
      defaultPrompt: input.defaultPrompt,
    });
  }

  function deleteMode(modeId: string) {
    modes.value = modes.value.filter(m => m.id !== modeId);
  }

  return {
    modes,
    enabledModes,
    updateMode,
    setAllModes,
    createCustomMode,
    deleteMode,
  };
});
