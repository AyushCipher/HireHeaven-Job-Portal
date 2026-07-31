import { describe, expect, it } from "vitest";
import ErrorHandler from "./errorHandler.js";

describe("ErrorHandler", () => {
  it("carries the status code and message", () => {
    const error = new ErrorHandler(404, "Not found");

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Not found");
  });

  it("captures a stack trace", () => {
    const error = new ErrorHandler(500, "boom");

    expect(error.stack).toBeDefined();
  });
});
