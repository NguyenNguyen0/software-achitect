const amqp = require("amqplib");

const RABBITMQ_URL = "amqp://localhost";
const QUEUE_NAME = "demo_queue";

async function sendMessage() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, {
      durable: false,
    });

    const message = `Hello RabbitMQ - ${new Date().toISOString()}`;

    channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
    console.log("📤 Sent:", message);

    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Publisher error:", error);
  }
}

sendMessage();
