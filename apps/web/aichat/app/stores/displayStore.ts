import { defineStore } from 'pinia';
import type { DisplayDevice } from '~/shared/types/display';

interface DisplayState {
  displays: DisplayDevice[];
  isLoading: boolean;
}

// In a real application, this data would come from the backend agent,
// which can query the OS for display information.
const mockDisplays: DisplayDevice[] = [
  {
    id: 'display-1',
    name: 'Monitor 1',
    bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    isPrimary: true,
  },
  {
    id: 'display-2',
    name: 'Monitor 2',
    bounds: { x: 1920, y: 0, width: 2560, height: 1440 },
    isPrimary: false,
  },
  {
    id: 'display-3',
    name: 'Laptop',
    bounds: { x: 0, y: 1080, width: 1440, height: 900 },
    isPrimary: false,
  },
];

export const useDisplayStore = defineStore('display', {
  state: (): DisplayState => ({
    displays: [],
    isLoading: false,
  }),
  actions: {
    async detectDisplays() {
      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 500));
      this.displays = mockDisplays;
      this.isLoading = false;
    },
  },
});
