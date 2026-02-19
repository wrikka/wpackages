import { defineStore } from 'pinia';
import type { PermissionCategory } from '~/shared/types/permissions';

interface PermissionsState {
  permissions: PermissionCategory[];
  isLoading: boolean;
}

const mockPermissions: PermissionCategory[] = [
  {
    id: 'fs',
    name: 'File System Access',
    permissions: [
      {
        id: 'fs_read',
        name: 'Read files',
        description: 'Allow agent to read contents of files.',
        enabled: true,
      },
      {
        id: 'fs_write',
        name: 'Write files',
        description: 'Allow agent to create, modify, or delete files.',
        enabled: false,
      },
      {
        id: 'fs_list',
        name: 'List directories',
        description: 'Allow agent to see the files and folders on your system.',
        enabled: true,
      },
    ],
  },
  {
    id: 'net',
    name: 'Network Access',
    permissions: [
      {
        id: 'net_request',
        name: 'Make web requests',
        description: 'Allow agent to access websites and APIs.',
        enabled: true,
      },
      {
        id: 'net_email',
        name: 'Send emails',
        description: 'Allow agent to send emails on your behalf.',
        enabled: false,
      },
    ],
  },
  {
    id: 'apps',
    name: 'Application Control',
    permissions: [
      {
        id: 'apps_launch',
        name: 'Launch applications',
        description: 'Allow agent to open applications.',
        enabled: true,
      },
      {
        id: 'apps_close',
        name: 'Close applications',
        description: 'Allow agent to quit running applications.',
        enabled: true,
      },
    ],
  },
];

export const usePermissionsStore = defineStore('permissions', {
  state: (): PermissionsState => ({
    permissions: [],
    isLoading: false,
  }),
  actions: {
    async loadPermissions() {
      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 300));
      // Deep copy to prevent reactivity issues in mock data
      this.permissions = JSON.parse(JSON.stringify(mockPermissions));
      this.isLoading = false;
    },
    async savePermissions() {
      console.log('Saving permissions:', this.permissions);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    updatePermission(permissionId: string, enabled: boolean) {
      for (const category of this.permissions) {
        const permission = category.permissions.find(p => p.id === permissionId);
        if (permission) {
          permission.enabled = enabled;
          break;
        }
      }
    },
  },
});
