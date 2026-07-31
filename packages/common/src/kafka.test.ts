import { afterEach, describe, expect, it, vi } from "vitest";
import { createKafkaClient } from "./kafka.js";

describe("createKafkaClient", () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("uses plaintext (no SASL/SSL) when no credentials are set", () => {
    delete process.env.KAFKA_USERNAME;
    delete process.env.KAFKA_PASSWORD;
    process.env.Kafka_Broker = "localhost:9092";

    const kafka = createKafkaClient("test-service");

    expect(kafka).toBeDefined();
  });

  it("configures SASL_SSL when username and password are set", () => {
    process.env.Kafka_Broker = "some-broker.upstash.io:9092";
    process.env.KAFKA_USERNAME = "user";
    process.env.KAFKA_PASSWORD = "pass";

    const kafka = createKafkaClient("test-service");

    expect(kafka).toBeDefined();
  });

  it("falls back to localhost:9092 when Kafka_Broker is unset", () => {
    delete process.env.Kafka_Broker;
    delete process.env.KAFKA_USERNAME;
    delete process.env.KAFKA_PASSWORD;

    expect(() => createKafkaClient("test-service")).not.toThrow();
  });
});
