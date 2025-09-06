const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Import model directly (no schema change needed)
const StressLog = require('../models/stresslog'); 
const ScreenTimeLogSchema = require("../models/screentimelog"); // adjust path if needed

router.get('/stress-summary', auth, async (req, res) => {
    const userId = req.user.id;

    try {
        const records = await StressLog.find({ user: userId });

        if (records.length === 0) {
            return res.status(200).json({ 
                avgStress: 0,
                maxStress: 0,
                minStress: 0,
                totalSessions: 0,
                message: 'No stress records found for this user.' 
            });
        }

        const totalSessions = records.length;
        const levels = records.map(record => record.level);
        const avgStress = (levels.reduce((sum, level) => sum + level, 0) / totalSessions).toFixed(2);
        const maxStress = Math.max(...levels);
        const minStress = Math.min(...levels);

        res.json({
            avgStress,
            maxStress,
            minStress,
            totalSessions
        });
    } catch (err) {
        console.error("Error fetching stress summary:", err);
        res.status(500).json({ message: err.message });
    }
});



router.get('/stress-logs', auth, async (req, res) => {
  try {
    const userId = req.user.id; // make sure auth sets user.id
    const records = await StressLog.find({ user: userId })
      .sort({ createdAt: 1 }) // oldest → newest
      .limit(50); // limit to latest 50 for chart

    // Transform for frontend
    const data = records.map(r => ({
      time: r.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      level: r.level
    }));

    res.json(data);
  } catch (err) {
    console.error("Error fetching stress logs:", err);
    res.status(500).json({ message: err.message });
  }
});





router.get('/stress-logs1', auth, async (req, res) => {
  try {
    const userId = req.user.id; 
    const records = await StressLog.find({ user: userId })
      .sort({ createdAt: -1 }) // latest first
      .limit(50); // prevent overload

    // Send raw data for table
    const data = records.map(r => ({
      date: r.createdAt.toISOString().replace("T", " ").slice(0, 16),
      level: r.level,
      method: r.method,
      site: r.site
    }));

    res.json(data);
  } catch (err) {
    console.error("Error fetching stress logs:", err);
    res.status(500).json({ message: err.message });
  }
});





// ----------------------
// Screen Time Route (Chart Data)
// GET /api/fetch/screen-time
// Get screen time per site for today
router.get("/screen-time", auth, async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    if (!userId) return res.status(400).json({ error: "User ID missing" });

    // Get today's date at 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await ScreenTimeLogSchema.findOne({ user: userId, date: today });

    if (!log) return res.json([]); // no data yet

    // Map sites to { site, minutes }
    const chartData = log.sites.map(site => ({
      site: site.site,
      minutes: Math.round(site.totalDurationMs / 60000), // ms → minutes
    }));

    res.json(chartData);
  } catch (err) {
    console.error("Error fetching screen time:", err);
    res.status(500).json({ error: "Server error" });
  }
});




router.get("/screen-time-summary", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all ScreenTimeLogs for this user
    const logs = await ScreenTimeLogSchema.find({ user: userId });

    let totalTime = 0;
    let longestSession = 0;
    let totalSessions = 0;
    const siteSet = new Set();

    logs.forEach(log => {
      log.sites.forEach(site => {
        siteSet.add(site.site);
        totalTime += site.totalDurationMs / 60000; // convert ms to minutes
        site.sessions.forEach(session => {
          totalSessions++;
          const durationMin = session.durationMs / 60000;
          if (durationMin > longestSession) longestSession = durationMin;
        });
      });
    });

    const avgSession = totalSessions ? Math.round(totalTime / totalSessions) : 0;

    res.json({
      totalTime: Math.round(totalTime),
      sitesVisited: siteSet.size,
      longestSession: Math.round(longestSession),
      avgSession
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});





router.get("/screen-time-records", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all logs for the user
    const logs = await ScreenTimeLogSchema.find({ user: userId });

    const siteMap = {}; // { siteName: { time: totalMinutes, sessions: count } }

    logs.forEach(log => {
      log.sites.forEach(site => {
        if (!siteMap[site.site]) {
          siteMap[site.site] = { time: 0, sessions: 0 };
        }

        siteMap[site.site].time += site.totalDurationMs / 60000; // ms to minutes
        siteMap[site.site].sessions += site.sessions.length;
      });
    });

    const records = Object.keys(siteMap).map(site => ({
      site,
      time: Math.round(siteMap[site].time),
      sessions: siteMap[site].sessions
    }));

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});





router.get("/screen-time-records1", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all screen time logs for the user.
    const logs = await ScreenTimeLogSchema.find({ user: userId });

    // Flatten and map the logs to the format the frontend expects.
    const records = logs.flatMap(log => 
      // Ensure log.sites is a valid array to prevent errors
      (log.sites || []).map(site => ({
        // This is the crucial line: it sends the date with each record
        date: log.date, 
        site: site.site,
        // Send time in minutes as the frontend expects
        time: Math.round(site.totalDurationMs / 60000),
      }))
    );
    
    // Send the formatted data to the frontend.
    res.json(records);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
