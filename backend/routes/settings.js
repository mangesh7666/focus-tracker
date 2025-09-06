const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

// GET /api/settings
router.get('/', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    res.json(user.settings);
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings
router.put('/', auth, async (req, res, next) => {
  try {
    const { stressThreshold, unfreezeDurationMinutes } = req.body; // Added unfreezeDurationMinutes
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (typeof stressThreshold === 'number') user.settings.stressThreshold = stressThreshold;
    if (typeof unfreezeDurationMinutes === 'number') user.settings.unfreezeDurationMinutes = unfreezeDurationMinutes; // Added
    await user.save();
    res.json(user.settings);
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings/custom-sites
// body: { site: 'newsite.com', dailyLimitMinutes: 30 }
router.put('/custom-sites', auth, async (req, res, next) => {
  try {
    const { site, dailyLimitMinutes } = req.body;
    if (!site || typeof dailyLimitMinutes !== 'number') {
      return res.status(400).json({ message: 'site and dailyLimitMinutes required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingSite = user.settings.customSiteLimits.find(s => s.site === site);
    if (existingSite) {
      existingSite.dailyLimitMinutes = dailyLimitMinutes;
    } else {
      user.settings.customSiteLimits.push({ site, dailyLimitMinutes });
    }
    
    await user.save();
    res.json(user.settings.customSiteLimits);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/settings/custom-sites/:site
router.delete('/custom-sites/:site', auth, async (req, res, next) => {
  try {
    const { site } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.settings.customSiteLimits = user.settings.customSiteLimits.filter(s => s.site !== site);
    await user.save();
    res.json({ message: 'Site limit removed.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
