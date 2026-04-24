// rabbit.js
require("dotenv").config();
const amqp = require("amqplib");

let channel;

async function connectQueue() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);

  channel = await connection.createChannel();
  await channel.assertQueue("write_queue", {
    durable: true
  });

  console.log("RabbitMQ connected");
}

function sendToQueue(data) {
  channel.sendToQueue(
    "write_queue",
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );
}

module.exports = { connectQueue, sendToQueue };