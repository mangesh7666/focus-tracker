// models/stresslog.js
/*const mongoose = require('mongoose');

const StressLog = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: Number, required: true }, // 0..1 scale or whichever you choose
  method: { type: String, enum: ['webcam', 'behavior', 'other'], default: 'other' },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StressLog', StressLog);*/



// models/stresslog.js
const mongoose = require('mongoose');

const StressLog = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: Number, required: true }, // 0..1 scale
  method: { type: String, enum: ['webcam', 'behavior', 'other'], default: 'webcam' },
  site: { type: String, required: true }, // A new field to store the site URL
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

//module.exports = mongoose.model('StressLog', StressLog);
const stresslog = mongoose.models.StressLog || mongoose.model('StressLog', StressLog);

module.exports=stresslog;