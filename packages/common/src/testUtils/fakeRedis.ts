import { RedisClientType } from "redis";

/**
 * A minimal in-memory stand-in for the subset of the redis client API our
 * code actually uses (incr/expire/ttl/get/set/del/scanIterator). Good enough
 * to unit test rate limiting, caching, and token storage without a real
 * Redis server.
 */
export const createFakeRedisClient = () => {
  const store = new Map<string, string>();
  const expirySeconds = new Map<string, number>();

  const fake = {
    store,
    async incr(key: string) {
      const current = Number(store.get(key) || "0") + 1;
      store.set(key, String(current));
      return current;
    },
    async expire(key: string, seconds: number) {
      expirySeconds.set(key, seconds);
      return true;
    },
    async ttl(key: string) {
      return expirySeconds.get(key) ?? -1;
    },
    async get(key: string) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    async set(key: string, value: string, _opts?: { EX?: number }) {
      store.set(key, value);
      return "OK";
    },
    async del(keys: string | string[]) {
      const list = Array.isArray(keys) ? keys : [keys];
      let count = 0;
      for (const key of list) {
        if (store.delete(key)) count++;
      }
      return count;
    },
    scanIterator(options?: { MATCH?: string; COUNT?: number }) {
      const pattern = options?.MATCH;
      const prefix = pattern?.endsWith("*") ? pattern.slice(0, -1) : pattern;

      const keys = Array.from(store.keys()).filter((key) =>
        prefix ? key.startsWith(prefix) : true
      );

      return (async function* () {
        for (const key of keys) {
          yield key;
        }
      })();
    },
  };

  return fake as unknown as RedisClientType;
};
