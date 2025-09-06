const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  durationMs: { type: Number, required: true }, // convenience field
});

const SiteSessionSchema = new mongoose.Schema({
  site: { type: String, required: true },
  sessions: { type: [SessionSchema], default: [] },
  totalDurationMs: { type: Number, default: 0 }, // sum of all sessions for quick access
});

const ScreenTimeLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { 
    type: Date, 
    required: true, 
    default: () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    } 
  },
  sites: { type: [SiteSessionSchema], default: [] },
});

// Unique index to allow one document per user per day
ScreenTimeLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ScreenTimeLog', ScreenTimeLogSchema);
