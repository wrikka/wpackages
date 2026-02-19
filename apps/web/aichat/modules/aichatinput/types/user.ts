export interface AppUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date | string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: Date | string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: 'admin' | 'member';
  joinedAt: Date | string;
}
