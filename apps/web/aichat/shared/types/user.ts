export interface AppUser {
  id: string;
  githubId?: number | null;
  username: string;
}

export interface OrganizationMember {
  organizationId: string;
  userId: string;
  role: 'owner' | 'member';
  user?: AppUser; // Populated from a join
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  members?: OrganizationMember[]; // Populated from a join
}
