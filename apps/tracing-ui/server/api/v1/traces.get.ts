export default defineEventHandler((event) => {
  return event.context.storage.spans;
});
