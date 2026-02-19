import { describe, it, expect } from "bun:test";
import {
  getHeader,
  getHeaders,
  isMethod,
  getMethod,
  getURL,
  getPath
} from "../src/utils";

describe("utils", () => {
  describe("getHeader", () => {
    it("should get header value", () => {
      const mockEvent = {
        request: new Request("http://localhost", {
          headers: { "content-type": "application/json" }
        }),
        response: new Response(),
        context: {},
      };

      const result = getHeader(mockEvent, "content-type");
      expect(result).toBe("application/json");
    });

    it("should return undefined for missing header", () => {
      const mockEvent = {
        request: new Request("http://localhost"),
        response: new Response(),
        context: {},
      };

      const result = getHeader(mockEvent, "missing-header");
      expect(result).toBeUndefined();
    });
  });

  describe("getHeaders", () => {
    it("should get all headers", () => {
      const mockEvent = {
        request: new Request("http://localhost", {
          headers: {
            "content-type": "application/json",
            "authorization": "Bearer token",
            "x-custom": "custom-value"
          }
        }),
        response: new Response(),
        context: {},
      };

      const result = getHeaders(mockEvent);
      expect(result).toEqual({
        "content-type": "application/json",
        "authorization": "Bearer token",
        "x-custom": "custom-value"
      });
    });
  });

  describe("isMethod", () => {
    it("should check method correctly", () => {
      const mockEvent = {
        request: new Request("http://localhost", { method: "GET" }),
        response: new Response(),
        context: {},
      };

      expect(isMethod(mockEvent, "GET")).toBe(true);
      expect(isMethod(mockEvent, "POST")).toBe(false);
    });
  });

  describe("getMethod", () => {
    it("should get method in uppercase", () => {
      const mockEvent = {
        request: new Request("http://localhost", { method: "get" }),
        response: new Response(),
        context: {},
      };

      expect(getMethod(mockEvent)).toBe("GET");
    });
  });

  describe("getURL", () => {
    it("should get full URL", () => {
      const mockEvent = {
        request: new Request("http://localhost:3000/path?query=value"),
        response: new Response(),
        context: {},
      };

      const url = getURL(mockEvent);
      expect(url.toString()).toBe("http://localhost:3000/path?query=value");
    });
  });

  describe("getPath", () => {
    it("should get path only", () => {
      const mockEvent = {
        request: new Request("http://localhost:3000/path?query=value"),
        response: new Response(),
        context: {},
      };

      expect(getPath(mockEvent)).toBe("/path");
    });
  });
});
