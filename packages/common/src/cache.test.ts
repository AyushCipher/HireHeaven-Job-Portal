import { describe, expect, it } from "vitest";
import { createCache } from "./cache.js";
import { createFakeRedisClient } from "./testUtils/fakeRedis.js";

describe("createCache", () => {
  it("returns null on a cache miss", async () => {
    const cache = createCache(createFakeRedisClient());

    expect(await cache.getCache("missing")).toBeNull();
  });

  it("round-trips a JSON value through set/get", async () => {
    const cache = createCache(createFakeRedisClient());

    await cache.setCache("job:1", { title: "Engineer" });

    expect(await cache.getCache("job:1")).toEqual({ title: "Engineer" });
  });

  it("removes a single key on invalidateKey", async () => {
    const cache = createCache(createFakeRedisClient());

    await cache.setCache("user:1", { id: 1 });
    await cache.invalidateKey("user:1");

    expect(await cache.getCache("user:1")).toBeNull();
  });

  it("removes every key matching a prefix on invalidateByPrefix", async () => {
    const cache = createCache(createFakeRedisClient());

    await cache.setCache("cache:job:all:a", [1]);
    await cache.setCache("cache:job:all:b", [2]);
    await cache.setCache("cache:job:single:1", { id: 1 });

    await cache.invalidateByPrefix("cache:job:all:");

    expect(await cache.getCache("cache:job:all:a")).toBeNull();
    expect(await cache.getCache("cache:job:all:b")).toBeNull();
    expect(await cache.getCache("cache:job:single:1")).toEqual({ id: 1 });
  });
});
