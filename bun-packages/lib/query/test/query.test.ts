import { beforeEach, describe, expect, test } from "bun:test";
import { Query } from "../src/query";
import { Cache } from "../src/cache";

describe("Cache", () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache();
  });

  test("should set and get values", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  test("should return undefined for non-existent keys", () => {
    expect(cache.get("nonexistent")).toBeUndefined();
  });

  test("should check if key exists", () => {
    cache.set("key1", "value1");
    expect(cache.has("key1")).toBe(true);
    expect(cache.has("nonexistent")).toBe(false);
  });

  test("should delete values", () => {
    cache.set("key1", "value1");
    cache.delete("key1");
    expect(cache.get("key1")).toBeUndefined();
  });

  test("should clear all values", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  test("should expire entries after TTL", async () => {
    cache.set("key1", "value1", 100); // 100ms TTL
    expect(cache.get("key1")).toBe("value1");
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(cache.get("key1")).toBeUndefined();
  });

  test("should evict oldest entry when at capacity", () => {
    const smallCache = new Cache({ maxSize: 2 });
    smallCache.set("key1", "value1");
    smallCache.set("key2", "value2");
    smallCache.set("key3", "value3");
    expect(smallCache.get("key1")).toBeUndefined();
    expect(smallCache.get("key2")).toBe("value2");
    expect(smallCache.get("key3")).toBe("value3");
  });
});

describe("Query", () => {
  let fetchCount = 0;

  beforeEach(() => {
    fetchCount = 0;
  });

  test("should fetch data and update state", async () => {
    const fetcher = async () => {
      fetchCount++;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { data: "test" };
    };

    const query = new Query("test-key", fetcher, { refetchOnMount: false });

    expect(query.current.isLoading).toBe(false);
    expect(query.current.data).toBeUndefined();

    const data = await query.fetch();

    expect(data).toEqual({ data: "test" });
    expect(query.current.data).toEqual({ data: "test" });
    expect(query.current.isSuccess).toBe(true);
    expect(query.current.isLoading).toBe(false);
    expect(fetchCount).toBe(1);

    query.destroy();
  });

  test("should use cached data if not stale", async () => {
    const fetcher = async () => {
      fetchCount++;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { data: "test" };
    };

    const query = new Query("test-key", fetcher, {
      staleTime: 1000,
      refetchOnMount: false,
    });

    await query.fetch();
    expect(fetchCount).toBe(1);

    // Second fetch should use cache
    await query.fetch();
    expect(fetchCount).toBe(1);

    query.destroy();
  });

  test("should refetch if data is stale", async () => {
    const fetcher = async () => {
      fetchCount++;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { data: "test" };
    };

    const query = new Query("test-key", fetcher, {
      staleTime: 50,
      refetchOnMount: false,
    });

    await query.fetch();
    expect(fetchCount).toBe(1);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should refetch because stale
    await query.fetch();
    expect(fetchCount).toBe(2);

    query.destroy();
  });

  test("should handle errors", async () => {
    const fetcher = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      throw new Error("Fetch failed");
    };

    const query = new Query("test-key", fetcher, { refetchOnMount: false });

    await expect(query.fetch()).rejects.toThrow("Fetch failed");
    expect(query.current.isError).toBe(true);
    expect(query.current.error).toBeInstanceOf(Error);

    query.destroy();
  });

  test("should retry on failure", async () => {
    let attempt = 0;
    const fetcher = async () => {
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (attempt < 3) {
        throw new Error("Temporary error");
      }
      return { data: "success" };
    };

    const query = new Query("test-key", fetcher, {
      retry: 2,
      retryDelay: 10,
      refetchOnMount: false,
    });

    const data = await query.fetch();
    expect(data).toEqual({ data: "success" });
    expect(attempt).toBe(3);

    query.destroy();
  });

  test("should subscribe to state changes", async () => {
    const states: any[] = [];
    const fetcher = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { data: "test" };
    };

    const query = new Query("test-key", fetcher, { refetchOnMount: false });

    const unsubscribe = query.subscribe((state) => {
      states.push({ status: state.status, isLoading: state.isLoading });
    });

    await query.fetch();

    expect(states.length).toBeGreaterThan(0);
    expect(states.some((s) => s.status === "loading")).toBe(true);
    expect(states.some((s) => s.status === "success")).toBe(true);

    unsubscribe();
    query.destroy();
  });

  test("should support manual data updates", async () => {
    const fetcher = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { data: "test" };
    };

    const query = new Query("test-key", fetcher, { refetchOnMount: false });

    query.setData({ data: "manual" });
    expect(query.current.data).toEqual({ data: "manual" });
    expect(query.current.isSuccess).toBe(true);

    query.destroy();
  });

  test("should support manual error updates", async () => {
    const fetcher = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { data: "test" };
    };

    const query = new Query("test-key", fetcher, { refetchOnMount: false });

    query.setError(new Error("Manual error"));
    expect(query.current.error).toBeInstanceOf(Error);
    expect(query.current.isError).toBe(true);

    query.destroy();
  });

  test("should reset state", async () => {
    const fetcher = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { data: "test" };
    };

    const query = new Query("test-key", fetcher, { refetchOnMount: false });

    await query.fetch();
    expect(query.current.data).toEqual({ data: "test" });

    query.reset();
    expect(query.current.data).toBeUndefined();
    expect(query.current.status).toBe("idle");

    query.destroy();
  });

  test("should invalidate cache and refetch", async () => {
    fetchCount = 0;
    const fetcher = async () => {
      fetchCount++;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { data: "test" };
    };

    const query = new Query("test-key", fetcher, {
      staleTime: 10000,
      refetchOnMount: false,
    });

    await query.fetch();
    expect(fetchCount).toBe(1);

    query.invalidate();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fetchCount).toBe(2);

    query.destroy();
  });

  test("should mutate data", async () => {
    const fetcher = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { count: 1 };
    };

    const query = new Query("test-key", fetcher, { refetchOnMount: false });

    await query.fetch();
    expect(query.current.data).toEqual({ count: 1 });

    const newData = await query.mutate((current) => ({
      count: (current?.count ?? 0) + 1,
    }));

    expect(newData).toEqual({ count: 2 });
    expect(query.current.data).toEqual({ count: 2 });

    query.destroy();
  });

  test("should cancel fetch", async () => {
    let shouldResolve = false;
    const fetcher = async () => {
      while (!shouldResolve) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      return { data: "test" };
    };

    const query = new Query("test-key", fetcher, { refetchOnMount: false });

    const fetchPromise = query.fetch();
    await new Promise((resolve) => setTimeout(resolve, 20));

    query.cancel();

    shouldResolve = true;
    await fetchPromise.catch(() => {
      // Expected to fail due to cancellation
    });

    expect(query.current.isLoading).toBe(false);

    query.destroy();
  });
});
