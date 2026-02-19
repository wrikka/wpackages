import { useState } from '#app'

export const useUser = () => {
  const user = useState<import('#shared/types/chat').AppUser | null>('user', () => null);
  return user;
};
