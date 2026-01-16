const amqp = require("amqplib");

const RABBITMQ_URL = "amqp://localhost";
const QUEUE_NAME = "demo_queue";

async function receiveMessage() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, {
      durable: false,
    });

    console.log("📥 Waiting for messages...");

    channel.consume(
      QUEUE_NAME,
      (msg) => {
        if (msg !== null) {
          console.log("✅ Received:", msg.content.toString());
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Consumer error:", error);
  }
}

receiveMessage();
