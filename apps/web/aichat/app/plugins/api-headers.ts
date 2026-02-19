import { ofetch } from 'ofetch';

export default defineNuxtPlugin((_nuxtApp) => {
  const orgStore = useOrganizationStore();
  (globalThis as any).$fetch = ofetch.create({
    onRequest({ options }) {
      if (orgStore.currentOrganizationId) {
        options.headers = {
          ...(options.headers as any),
          'x-org-id': orgStore.currentOrganizationId,
        } as any;
      }
    },
  });
});
