


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
