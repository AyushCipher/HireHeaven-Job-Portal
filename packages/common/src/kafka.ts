import { Kafka, SASLMechanism, SASLOptions } from "kafkajs";

const SUPPORTED_MECHANISMS: SASLMechanism[] = [
  "plain",
  "scram-sha-256",
  "scram-sha-512",
];

/**
 * Builds a Kafka client from env vars shared by every service:
 * Kafka_Broker (required for a real connection), and optionally
 * KAFKA_USERNAME/KAFKA_PASSWORD. Hosted brokers (Upstash, Redpanda,
 * Confluent, etc.) require SASL_SSL auth; a bare local broker (e.g. via
 * docker-compose) doesn't, so SASL/SSL is only applied when credentials
 * are present. The SASL mechanism defaults to scram-sha-256 but differs
 * by provider -- override with KAFKA_SASL_MECHANISM if a broker rejects
 * the default (e.g. some Redpanda clusters require scram-sha-512).
 */
export const createKafkaClient = (clientId: string): Kafka => {
  const broker = process.env.Kafka_Broker || "localhost:9092";
  const username = process.env.KAFKA_USERNAME;
  const password = process.env.KAFKA_PASSWORD;

  if (username && password) {
    const requestedMechanism = (
      process.env.KAFKA_SASL_MECHANISM || "scram-sha-256"
    ).toLowerCase() as SASLMechanism;

    const mechanism = SUPPORTED_MECHANISMS.includes(requestedMechanism)
      ? requestedMechanism
      : "scram-sha-256";

    return new Kafka({
      clientId,
      brokers: [broker],
      ssl: true,
      // All three supported mechanisms share the same { mechanism, username,
      // password } shape; the cast is safe since `mechanism` was already
      // validated against SUPPORTED_MECHANISMS above.
      sasl: { mechanism, username, password } as SASLOptions,
    });
  }

  return new Kafka({
    clientId,
    brokers: [broker],
  });
};
