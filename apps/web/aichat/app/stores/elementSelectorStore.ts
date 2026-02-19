import { defineStore } from 'pinia';
import type { ScreenElement } from '~/shared/types/agent';

interface ElementSelectorState {
  isActive: boolean;
  detectedElements: ScreenElement[];
  selectedElement: ScreenElement | null;
  isActionMenuVisible: boolean;
}

export const useElementSelectorStore = defineStore('elementSelector', {
  state: (): ElementSelectorState => ({
    isActive: false,
    detectedElements: [],
    selectedElement: null,
    isActionMenuVisible: false,
  }),
  actions: {
    activate() {
      this.isActive = true;
      // TODO: Call backend to get detected elements
      this.detectedElements = [
        // Mock data
        {
          id: 'el1',
          elementType: 'Button',
          bounds: { x: 100, y: 150, width: 120, height: 40 },
          text: 'Login',
        },
        { id: 'el2', elementType: 'TextField', bounds: { x: 100, y: 200, width: 250, height: 30 } },
        { id: 'el3', elementType: 'Table', bounds: { x: 100, y: 250, width: 600, height: 200 } },
      ];
    },
    deactivate() {
      this.isActive = false;
      this.detectedElements = [];
      this.selectedElement = null;
      this.isActionMenuVisible = false;
    },
    setSelectedElement(element: ScreenElement) {
      this.selectedElement = element;
    },
    showActionMenu() {
      this.isActionMenuVisible = true;
    },
    hideActionMenu() {
      this.isActionMenuVisible = false;
    },
  },
});
