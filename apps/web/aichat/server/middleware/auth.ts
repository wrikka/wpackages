// Temporarily disabled auth middleware
export default defineEventHandler(async (event) => {
  // Set mock user for development
  event.context.session = null;
  event.context.user = {
    id: 'mock-user-id',
    email: 'mock@example.com',
    name: 'Mock User',
  };
});

declare module 'h3' {
  interface H3EventContext {
    user: any | null;
    session: any | null;
  }
}
