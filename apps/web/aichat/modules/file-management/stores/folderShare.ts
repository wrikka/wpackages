import type { Folder } from '#shared/types/folder';
import { defineStore } from 'pinia';

export const useFolderShareStore = defineStore('folderShare', {
  actions: {
    closeShareModal() {
      this.isModalOpen = false;
      this.sharingFolder = null;
    },
    openShareModal(folder: Folder) {
      this.sharingFolder = folder;
      this.isModalOpen = true;
    },
  },
  state: () => ({
    isModalOpen: false,
    sharingFolder: null as Folder | null,
  }),
});
