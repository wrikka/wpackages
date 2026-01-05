// This plugin initializes a simple in-memory store for spans.
// It's available on event.context.storage

const receivedSpans: any[] = [];

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    event.context.storage = {
      spans: receivedSpans,
    };
  });
});
