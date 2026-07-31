import { describe, expect, it } from "vitest";
import {
  blacklistAccessToken,
  isAccessTokenBlacklisted,
  isRefreshTokenValid,
  revokeRefreshToken,
  signAccessToken,
  signRefreshToken,
  storeRefreshToken,
  verifyToken,
  AccessTokenPayload,
  RefreshTokenPayload,
} from "./tokens.js";
import { createFakeRedisClient } from "./testUtils/fakeRedis.js";

const secret = "test-secret";
const subject = { id: 42, role: "jobseeker" };

describe("access/refresh tokens", () => {
  it("signs an access token that verifies back to the same subject", () => {
    const { token, jti } = signAccessToken(subject, secret);

    const decoded = verifyToken<AccessTokenPayload>(token, secret);

    expect(decoded.id).toBe(subject.id);
    expect(decoded.role).toBe(subject.role);
    expect(decoded.type).toBe("access");
    expect(decoded.jti).toBe(jti);
  });

  it("signs a refresh token distinguishable from an access token", () => {
    const { token } = signRefreshToken(subject, secret);

    const decoded = verifyToken<RefreshTokenPayload>(token, secret);

    expect(decoded.type).toBe("refresh");
  });

  it("rejects a token signed with a different secret", () => {
    const { token } = signAccessToken(subject, secret);

    expect(() => verifyToken(token, "wrong-secret")).toThrow();
  });

  it("tracks refresh token validity in redis and revokes it", async () => {
    const redis = createFakeRedisClient();
    const { jti } = signRefreshToken(subject, secret);

    await storeRefreshToken(redis, subject.id, jti);
    expect(await isRefreshTokenValid(redis, jti)).toBe(true);

    await revokeRefreshToken(redis, jti);
    expect(await isRefreshTokenValid(redis, jti)).toBe(false);
  });

  it("blacklists an access token for its remaining lifetime", async () => {
    const redis = createFakeRedisClient();
    const { jti } = signAccessToken(subject, secret);

    expect(await isAccessTokenBlacklisted(redis, jti)).toBe(false);

    await blacklistAccessToken(redis, jti, 900);

    expect(await isAccessTokenBlacklisted(redis, jti)).toBe(true);
  });

  it("does not blacklist when the remaining ttl is already zero", async () => {
    const redis = createFakeRedisClient();
    const { jti } = signAccessToken(subject, secret);

    await blacklistAccessToken(redis, jti, 0);

    expect(await isAccessTokenBlacklisted(redis, jti)).toBe(false);
  });
});
