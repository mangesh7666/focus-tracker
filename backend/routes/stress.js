// routes/stress.js
/*const express = require('express');
const auth = require('../middleware/auth');
const StressLog = require('../models/StressLog');
const User = require('../models/User');
const Subscription = require('../models/subscription');
const webpush = require('web-push');

const router = express.Router();

// POST /api/stress/log
router.post('/log', auth, async (req, res, next) => {
  try {
    const { level = 0, method = 'other', meta = {} } = req.body;
    const log = await StressLog.create({ user: req.user.id, level, method, meta });

    // fetch user settings and notify if threshold exceeded
    const user = await User.findById(req.user.id);
    if (user && level >= (user.settings?.stressThreshold ?? 0.75)) {
      const subs = await Subscription.find({ user: req.user.id });
      const payload = JSON.stringify({ type: 'stress-alert', level, message: 'High stress detected — consider taking a break' });
      subs.forEach(s => {
        webpush.sendNotification(s.subscription, payload).catch(err => console.error('push err', err && err.stack ? err.stack : err));
      });
    }

    res.json(log);
  } catch (err) {
    next(err);
  }
});

// GET /api/stress/history?from=&to=&limit=
router.get('/history', auth, async (req, res, next) => {
  try {
    const before = req.query.to ? new Date(req.query.to) : new Date();
    const after = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // default 7 days
    const limit = Number(req.query.limit) || 200;

    const logs = await StressLog.find({
      user: req.user.id,
      createdAt: { $gte: after, $lte: before }
    }).sort({ createdAt: -1 }).limit(limit);

    res.json(logs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;*/


const express = require('express');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const router = express.Router();

const auth = require('../middleware/auth'); // Your existing auth middleware
const upload = require('../config/multer'); // We'll create this next
const StressLog = require('../models/stresslog');

// POST /api/stress/process-video - Main endpoint to receive video from the extension
router.post('/process-video', auth, upload.single('video'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided.' });
    }

    const { site } = req.body;
    const videoPath = req.file.path;

    // Create form data to send the video and site info to Python
    const form = new FormData();
    form.append('video', fs.createReadStream(videoPath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    form.append('site', site);

    // Forward the video to the Python microservice
    const pythonResponse = await axios.post('https://focus-tracker-3.onrender.com/analyze_video', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const { stress_score, method } = pythonResponse.data;

    // Save the stress log to MongoDB
    const log = await StressLog.create({
      user: req.user.id,
      level: stress_score,
      method: method,
      site: site,
    });

    // Your existing push notification logic would go here
    // if (log.level >= (req.user.settings?.stressThreshold ?? 0.75)) { ... }

    res.json({ message: 'Video processed and log saved.', log });

  } catch (err) {
    console.error('Error processing video:', err.response?.data || err.message);
    next(err);
  } finally {
    // Clean up the temporary video file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

// GET /api/stress/latest - New endpoint for the extension to fetch the latest score
router.get('/latest', auth, async (req, res, next) => {
  try {
    const latestLog = await StressLog.findOne({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!latestLog) {
      return res.status(404).json({ message: 'No stress logs found.' });
    }

    res.json(latestLog);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
