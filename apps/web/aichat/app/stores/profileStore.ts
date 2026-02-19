import { defineStore } from 'pinia';
import type { AgentProfile } from '~/shared/types/profiles';

interface ProfileState {
  profiles: AgentProfile[];
  activeProfileId: string | null;
  isLoading: boolean;
}

const mockProfiles: AgentProfile[] = [
  {
    id: 'prof-1',
    name: 'Default Assistant',
    description: 'A general-purpose profile with balanced capabilities and standard permissions.',
  },
  {
    id: 'prof-2',
    name: 'Developer Pro',
    description:
      'Optimized for coding tasks. Has access to developer tools and can execute scripts.',
  },
];

export const useProfileStore = defineStore('profiles', {
  state: (): ProfileState => ({
    profiles: [],
    activeProfileId: 'prof-1',
    isLoading: false,
  }),
  actions: {
    async loadProfiles() {
      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 200));
      this.profiles = mockProfiles;
      this.isLoading = false;
    },
    setActiveProfile(profileId: string) {
      this.activeProfileId = profileId;
      console.log(`Active profile set to: ${profileId}`);
    },
    createProfile(profile: Omit<AgentProfile, 'id'>) {
      const newProfile: AgentProfile = {
        ...profile,
        id: `prof-${Date.now()}`,
      };
      this.profiles.push(newProfile);
    },
  },
});
