import { defineStore } from 'pinia';
import type { AppSettings } from '~/shared/types/settings';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
}

const defaultSettings: AppSettings = {
  sandboxMode: true,
  performance: {
    cpuLimitPercent: 75,
    memoryLimitMB: 2048,
  },
};

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    settings: { ...defaultSettings },
    isLoading: false,
  }),
  actions: {
    async loadSettings() {
      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 200));
      // In a real app, load from a config file or local storage
      this.settings = JSON.parse(JSON.stringify(defaultSettings));
      this.isLoading = false;
    },
    async saveSettings() {
      console.log('Saving settings:', this.settings);
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
      this.settings[key] = value;
    },
  },
});
