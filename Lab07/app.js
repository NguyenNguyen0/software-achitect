// app.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const redis = require("./redis");
const Item = require("./model");
const { connectQueue, sendToQueue } = require("./rabbit");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch(console.error);

// connect Rabbit
connectQueue();


// ===== READ =====
app.get("/items", async (req, res) => {
  try {
    const cache = await redis.get("items");

    if (cache) {
      console.log("CACHE HIT");
      return res.json(JSON.parse(cache));
    }

    console.log("CACHE MISS");

    const data = await Item.find();

    await redis.set("items", JSON.stringify(data), "EX", 60);

    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// ===== WRITE =====
app.post("/items", async (req, res) => {
  try {
    sendToQueue(req.body);

    res.json({ status: "queued" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});