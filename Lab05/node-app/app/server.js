const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Kết nối MongoDB
mongoose.connect("mongodb://mongo:27017/testdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error(err));

// Schema đơn giản
const ItemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", ItemSchema);

// API
app.get("/", (req, res) => {
  res.send("Node.js + MongoDB is running!");
});

app.post("/items", async (req, res) => {
  const item = new Item({ name: req.body.name });
  await item.save();
  res.json(item);
});

app.get("/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});