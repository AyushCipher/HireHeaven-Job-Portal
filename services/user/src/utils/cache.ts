import { redisClient } from "./redisClient.js";

const DEFAULT_TTL_SECONDS = 60;

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redisClient.get(key);
    return cached ? (JSON.parse(cached) as T) : null;
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
};

export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<void> => {
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error("Cache write error:", error);
  }
};

export const invalidateCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
};
