import { Effect } from "effect";
import * as Schema from "@effect/schema/Schema";
import { Api } from "./builder";

const handleRequest = (api: Api, req: Request) => {
  const url = new URL(req.url);

  for (const key in api.handlers) {
    const handlerDef = api.handlers[key];
    if (url.pathname === handlerDef.path && req.method === handlerDef.method) {

      const program = Effect.gen(function*(_) {
        let body: unknown = undefined;

        if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
            body = yield* _(Effect.tryPromise({
                try: () => req.json(),
                catch: () => ({ _tag: 'JsonParseError' as const })
            }));
        }

        // 1. Validate request body
        if (handlerDef.schema?.body) {
            const parseBody = Schema.decodeUnknown(handlerDef.schema.body);
            const parsedBody = yield* _(parseBody(body));
            body = parsedBody;
        }

        // 2. Execute the handler
        const result = yield* _(handlerDef.handler(body));

        // 3. Validate response
        if (handlerDef.schema?.response) {
            const encodeResponse = Schema.encode(handlerDef.schema.response);
            const encodedResult = yield* _(encodeResponse(result));
            return new Response(JSON.stringify(encodedResult), { 
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(result), { 
            headers: { 'Content-Type': 'application/json' }
        });
      });

      return Effect.runPromise(program).catch(error => {
        return new Response(JSON.stringify({ error }), { status: 500 });
      });
    }
  }

  return Promise.resolve(new Response("Not Found", { status: 404 }));
};

export const createApiHandler = (api: Api) => {
  return (req: Request) => handleRequest(api, req);
};

export const createServer = (api: Api) => {
    console.log("Starting server...");
    const server = Bun.serve({
        port: 3000,
        fetch: createApiHandler(api),
    });
    console.log(`Server listening on http://localhost:${server.port}`);
    return server;
};
