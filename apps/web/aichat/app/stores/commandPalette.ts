import { defineStore } from 'pinia';

export const useCommandPaletteStore = defineStore('commandPalette', {
  actions: {
    close() {
      this.isOpen = false;
    },
    open() {
      this.isOpen = true;
    },
    toggle() {
      this.isOpen = !this.isOpen;
    },
  },
  state: () => ({
    isOpen: false,
  }),
});
