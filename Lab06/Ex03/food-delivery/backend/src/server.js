require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date().toISOString() }));

// DB init
async function initDB() {
  const sql = fs.readFileSync(path.join(__dirname, 'config/init.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initDB();
});
