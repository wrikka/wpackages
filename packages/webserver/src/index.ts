import { getQuery, readBody } from "./utils/request";
import fastJson from 'fast-json-stringify';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

type Handler = (req: Request) => Response | Promise<Response>;

const searchStringifier = fastJson({
  type: 'object',
  patternProperties: {
    '.*': { type: 'string' }
  }
});

const _echoStringifier = fastJson({
  type: 'object',
  properties: {
    received: { type: 'object', additionalProperties: true }
  }
});

const HOME_RESPONSE = new Response("Welcome to the homepage!");
const USERS_RESPONSE = new Response(JSON.stringify({ id: 1, name: 'John Doe' }), { headers: JSON_HEADERS });

const router: Record<string, Partial<Record<string, Handler>>> = {
  '/': {
    GET: () => HOME_RESPONSE,
  },
  '/users': {
    GET: () => USERS_RESPONSE,
  },
  '/search': {
    GET: (req) => new Response(searchStringifier(getQuery(req)), { headers: JSON_HEADERS }),
  },
  '/echo': {
    POST: async (req) => {
      const body = await readBody(req);
      return new Response(JSON.stringify({ received: body }), { headers: JSON_HEADERS });
    },
  },
};

export function createServer(port: number) {
  return Bun.serve({
    port,
    async fetch(req: Request) {
      const url = req.url;
      const queryIndex = url.indexOf('?');
      const pathname = queryIndex === -1 
        ? url.substring(url.indexOf('/', 8)) 
        : url.substring(url.indexOf('/', 8), queryIndex);

      const handler = router[pathname]?.[req.method];

      if (handler) {
        return handler(req);
      }

      return new Response("Page not found", { status: 404 });
    },
  });
}

async function startServer() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 0;
  const server = createServer(port);
  console.log(`Server running at http://${server.hostname}:${server.port}/`);
}

if (import.meta.main) {
  startServer();
}
