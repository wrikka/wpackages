import mermaid from 'mermaid';

export default defineNuxtPlugin(() => {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
  });

  return {
    provide: {
      mermaid,
    },
  };
});
