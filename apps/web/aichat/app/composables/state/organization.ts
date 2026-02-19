import type { Organization } from '#shared/types/user';

export const useOrganization = () => useState<Organization | null>('organization', () => null);
