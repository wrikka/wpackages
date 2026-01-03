import { describe, it, expect } from 'bun:test';
import { Effect } from 'effect';
import * as Schema from '@effect/schema/Schema';
import { builder, createApiHandler, createClient } from '../src';

describe('API Builder', () => {
  const User = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
  });

  const api = builder()
    .post('getUser', '/user', {
      schema: {
        response: User,
      },
      handler: () => Effect.succeed({ id: 1, name: 'Test User' }),
    })
    .build();

  it('should create and run a server, and client should fetch data', async () => {
    // Start server in the background
    const server = Bun.serve({ port: 0, fetch: createApiHandler(api) });
    
    const { port } = server;
    const client = createClient<typeof api>(`http://localhost:${port}`, api);

    const user = await client.getUser(undefined);

    expect(user).toEqual({ id: 1, name: 'Test User' });

    server.stop();
  });
});
