const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },


   profile: {
    avatar: { type: String, default: "" }, // URL or file path
    bio: { type: String, default: "" },
  },

  // Add other user fields here, e.g., settings
  settings: {
    customSiteLimits: [{
      site: String,
      dailyLimitMinutes: Number,
    }],
    unfreezeDurationMinutes: {
      type: Number,
      default: 15,
    },
  },
});

// The key change is here:
// This checks if the 'User' model has already been compiled.
// If it has, it exports the existing model.
// If not, it compiles and exports the new model.
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;


