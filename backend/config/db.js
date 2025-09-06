// config/db.js
const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ Mongo connection error:', err.message);
    process.exit(1);
  }
};
