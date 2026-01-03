import { ref } from 'vue';

export const useTabs = () => {
  const tabs = ref([
    { name: 'Dev', path: '/' },
    { name: 'Build', path: '/build' },
    { name: 'Deps', path: '/deps' },
    { name: 'Preview', path: '/preview' },
    { name: 'Lint', path: '/lint' },
    { name: 'Unused', path: '/unused' },
    { name: 'README', path: '/readme' },
  ]);

  return {
    tabs,
  };
};
