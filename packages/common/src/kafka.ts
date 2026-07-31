import { Kafka } from "kafkajs";

/**
 * Builds a Kafka client from env vars shared by every service:
 * Kafka_Broker (required for a real connection), and optionally
 * KAFKA_USERNAME/KAFKA_PASSWORD. Hosted brokers (Upstash, Confluent, etc.)
 * require SASL_SSL auth; a bare local broker (e.g. via docker-compose)
 * doesn't, so SASL/SSL is only applied when credentials are present.
 */
export const createKafkaClient = (clientId: string): Kafka => {
  const broker = process.env.Kafka_Broker || "localhost:9092";
  const username = process.env.KAFKA_USERNAME;
  const password = process.env.KAFKA_PASSWORD;

  if (username && password) {
    return new Kafka({
      clientId,
      brokers: [broker],
      ssl: true,
      sasl: {
        mechanism: "scram-sha-256",
        username,
        password,
      },
    });
  }

  return new Kafka({
    clientId,
    brokers: [broker],
  });
};
