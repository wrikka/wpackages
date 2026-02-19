export interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface PermissionCategory {
  id: string;
  name: string;
  permissions: Permission[];
}
