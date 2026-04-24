// loadtest.js
const axios = require("axios");

const TOTAL_RPS = 1000;

setInterval(() => {
  for (let i = 0; i < TOTAL_RPS; i++) {
    axios.get("http://localhost:3000/items")
      .catch(() => { });
    console.log(`Sent ${i + 1} requests`);
  }
}, 1000);