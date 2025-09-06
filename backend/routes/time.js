const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const ScreenTimeLog = require('../models/screentimelog');
const User = require('../models/user');
const Subscription = require('../models/subscription');
const webpush = require('web-push');

const router = express.Router();

router.post('/log', auth, async (req, res, next) => {
    try {
        let sessions = req.body.sessions;

        // If 'sessions' is not an array, assume it's a single session for backward compatibility.
        if (!Array.isArray(sessions)) {
            const { site, startTime, endTime } = req.body;
            sessions = [{ site, startTime, endTime }];
        }

        if (!sessions || sessions.length === 0) {
            return res.status(400).json({ message: 'No sessions provided.' });
        }

        // Helper function to process a single session
        const processSession = async (session) => {
            let { site, startTime, endTime } = session;
            if (!site || !startTime || !endTime) {
                return; // Skip invalid sessions in the batch
            }

            site = site.replace(/^https?:\/\/(www\.)?/, '').split(/[/?#]/)[0];
            startTime = new Date(startTime);
            endTime = new Date(endTime);
            const durationMs = endTime - startTime;
            if (durationMs <= 0) return;

            const dateOnly = new Date(startTime);
            dateOnly.setHours(0, 0, 0, 0);

            let record = await ScreenTimeLog.findOneAndUpdate(
                {
                    user: req.user.id,
                    date: dateOnly,
                    'sites.site': site
                },
                {
                    $push: { 'sites.$.sessions': { startTime, endTime, durationMs } },
                    $inc: { 'sites.$.totalDurationMs': durationMs },
                    $set: { 'user': req.user.id, 'date': dateOnly }
                },
                { new: true }
            );

            if (!record) {
                record = await ScreenTimeLog.findOneAndUpdate(
                    { user: req.user.id, date: dateOnly },
                    {
                        $push: {
                            sites: {
                                site,
                                sessions: [{ startTime, endTime, durationMs }],
                                totalDurationMs: durationMs
                            }
                        }
                    },
                    { new: true, upsert: true }
                );
            }

            const siteEntry = record.sites.find(s => s.site === site);
            const user = await User.findById(req.user.id);
            const siteLimit = user?.settings?.customSiteLimits.find(l => l.site === site);
            const dailyLimitMinutes = siteLimit?.dailyLimitMinutes || 60;
            const dailyLimitMs = dailyLimitMinutes * 60 * 1000;
            const limitExceeded = siteEntry.totalDurationMs >= dailyLimitMs;

            if (limitExceeded) {
                const subscriptions = await Subscription.find({ user: req.user.id });
                const payload = JSON.stringify({
                    type: 'time-limit',
                    totalTodayMs: siteEntry.totalDurationMs,
                    dailyLimitMs,
                    message: `Daily time limit for ${site} reached.`,
                });

                await Promise.allSettled(
                    subscriptions.map(s =>
                        webpush.sendNotification(s.subscription, payload).catch(async err => {
                            if (err.statusCode === 410) {
                                await Subscription.deleteOne({ _id: s._id });
                            }
                        }),
                    ),
                );
            }
        };

        // Process all sessions in the batch concurrently
        await Promise.all(sessions.map(s => processSession(s)));

        res.json({ ok: true, message: `Successfully logged ${sessions.length} sessions.` });

    } catch (err) {
        next(err);
    }
});

// GET /api/time/daily?date=YYYY-MM-DD
router.get('/daily', auth, async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const agg = await ScreenTimeLog.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          createdAt: { $gte: date, $lt: nextDay }
        }
      },
      { $group: { _id: null, totalMs: { $sum: '$durationMs' } } }
    ]);

    const totalMilliseconds = (agg[0] && agg[0].totalMs) || 0;

    res.json({ totalMilliseconds });
  } catch (err) {
    next(err);
  }
});


router.get("/daily-by-site", auth, async (req, res) => {
  try {
    console.log("Fetching all screen time for user:", req.user.id);

    // Fetch all documents for the user
    const records = await ScreenTimeLog.find({ user: req.user.id }).lean();

    if (!records || records.length === 0) {
      console.log("No screen time records found");
      return res.json([]);
    }

    // Aggregate totalDurationMs per site across all records
    const siteTotals = {};

    records.forEach(record => {
      record.sites.forEach(({ site, totalDurationMs }) => {
        if (!siteTotals[site]) {
          siteTotals[site] = 0;
        }
        siteTotals[site] += totalDurationMs || 0;
      });
    });

    // Convert to array format with totalMinutes
    const result = Object.entries(siteTotals).map(([site, totalDurationMs]) => ({
      site,
      totalDurationMs,
      totalMinutes: totalDurationMs / 60000,
    }));

    console.log("Returning aggregated result:", result);

    res.json(result);
  } catch (error) {
    console.error("Error fetching daily-by-site (all days):", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
