export interface Folder {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  color?: string;
  icon?: string;
  parentId?: string | null;
  order?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FolderWithChildren extends Folder {
  children: FolderWithChildren[];
  sessionCount: number;
}
