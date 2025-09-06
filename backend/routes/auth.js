// routes/auth.js
const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, password } = req.body;
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: 'User already exists' });

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      user = new User({ name, email, password: hash });
      await user.save();

      const payload = { id: user._id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({ token, user: { id: user._id, name: user.name, email: user.email, settings: user.settings } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [body('email').isEmail(), body('password').exists()],
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const payload = { id: user._id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({ token, user: { id: user._id, name: user.name, email: user.email, settings: user.settings } });
    } catch (err) {
      next(err);
    }
  }
);










// Simple disk storage for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads1/'); // make sure /uploads exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// PUT /api/profile/avatar
router.put('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.avatar = `uploads1/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Profile image updated', avatar: user.profile.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/profile/bio
router.put('/bio', auth, async (req, res) => {
  try {
    const { bio } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile.bio = bio;
    await user.save();

    res.json({ message: 'Bio updated', bio: user.profile.bio });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// GET /auth/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email profile");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      profile: {
        email: user.email,
        avatar: user.profile.avatar || "",
        bio: user.profile.bio || "",
      },
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});





module.exports = router;
