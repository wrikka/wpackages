import { defineStore } from 'pinia';

export const useCommandBarStore = defineStore('commandBar', {
  state: () => ({
    isVisible: false,
  }),
  actions: {
    show() {
      this.isVisible = true;
    },
    hide() {
      this.isVisible = false;
    },
    toggle() {
      this.isVisible = !this.isVisible;
    },
  },
});
