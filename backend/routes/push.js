// routes/push.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Subscription = require('../models/subscription');
const webpush = require('web-push');

// POST /api/push/subscribe
// body: { subscription: { endpoint, keys: { p256dh, auth } } }
router.post('/subscribe', auth, async (req, res, next) => {
  try {
    const { subscription } = req.body;
    if (!subscription) return res.status(400).json({ message: 'subscription required' });

    // deduplicate by endpoint
    await Subscription.updateOne(
      { 'subscription.endpoint': subscription.endpoint, user: req.user.id },
      { $set: { subscription } },
      { upsert: true }
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/push/send-test
// sends test notification to all user's subscriptions
router.post('/send-test', auth, async (req, res, next) => {
  try {
    const subs = await Subscription.find({ user: req.user.id });
    const payload = JSON.stringify({ type: 'test', message: 'This is a test notification' });
    const results = [];
    for (const s of subs) {
      try {
        await webpush.sendNotification(s.subscription, payload);
        results.push({ endpoint: s.subscription.endpoint, status: 'sent' });
      } catch (e) {
        console.error('send err', e);
        results.push({ endpoint: s.subscription.endpoint, status: 'error' });
      }
    }
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;