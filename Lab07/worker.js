// worker.js
require("dotenv").config();

const amqp = require("amqplib");
const mongoose = require("mongoose");
const Item = require("./model");
const redis = require("./redis");

async function startWorker() {
  await mongoose.connect(process.env.MONGO_URI);

  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue("write_queue", {
    durable: true
  });

  console.log("Worker started");

  channel.consume("write_queue", async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());

      await Item.create(data);

      // clear cache
      await redis.del("items");

      channel.ack(msg);
    } catch (err) {
      console.error(err);
      // có thể retry hoặc reject
      channel.nack(msg, false, false);
    }
  });
}

startWorker();