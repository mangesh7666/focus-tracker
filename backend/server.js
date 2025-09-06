// server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const webpush = require('web-push');
const path = require("path");

// Define your Chrome Extension ID directly in the file
const CHROME_EXTENSION_ID = 'gclpnpgdmbealaflaiknlhiimpgimmmn'; 

// Connect to the database
connectDB();

const app = express();
app.use(helmet());
app.use(morgan('dev'));

// ✅ CORS Configuration
const allowedOrigins = [
  `chrome-extension://${CHROME_EXTENSION_ID}`,
  "http://localhost:3000",
  "https://focus-tracker-2.onrender.com"   // your deployed frontend
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

// ✅ Configure web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// ✅ Routes
app.get('/api/push/vapid-key', (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return res.status(500).json({ message: 'VAPID public key not configured on server.' });
  }
  res.send(process.env.VAPID_PUBLIC_KEY);
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/stress', require('./routes/stress'));
app.use('/api/time', require('./routes/time'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/push', require('./routes/push'));
app.use('/api/fetch', require('./routes/fetch'));

// ✅ Error handler middleware
app.use(require('./middleware/errorHandler'));

// ✅ Static file serving
app.use("/uploads1", cors(), express.static(path.join(__dirname, "uploads1")));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
