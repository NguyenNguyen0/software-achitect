// model.js
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: String,
  value: Number
}, { timestamps: true });

module.exports = mongoose.model("Item", ItemSchema);