import { describe, it, expect } from "bun:test";
import { createApp } from "../src/lib/app";
import { defineEventHandler } from "../src";

describe("createApp", () => {
  it("should create an app instance", () => {
    const app = createApp();

    expect(app).toBeDefined();
    expect(typeof app.use).toBe("function");
    expect(typeof app.handle).toBe("function");
  });

  it("should handle event handlers", async () => {
    const app = createApp();

    app.use(defineEventHandler(() => "Hello World"));

    const mockEvent = {
      request: new Request("http://localhost"),
      response: new Response(),
      context: {},
    };

    const result = await app.handle(mockEvent);
    expect(result).toBe("Hello World");
  });

  it("should return 404 when no handler matches", async () => {
    const app = createApp();

    const mockEvent = {
      request: new Request("http://localhost"),
      response: new Response(),
      context: {},
    };

    const result = await app.handle(mockEvent);
    expect(result.status).toBe(404);
    expect(result.body).toBe("Not Found");
  });
});
