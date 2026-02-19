import type { H3App, H3Event, H3EventHandler } from "../types";

export function createApp(): H3App {
  const handlers: H3EventHandler[] = [];

  const app: H3App = {
    use(handler: H3EventHandler) {
      handlers.push(handler);
    },

    async handle(event: H3Event) {
      for (const handler of handlers) {
        const result = await handler(event);
        if (result !== undefined) {
          return result;
        }
      }
      return { status: 404, body: "Not Found" };
    },
  };

  return app;
}
