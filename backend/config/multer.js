// config/multer.js
const multer = require('multer');

// Configure Multer to save files to a temporary 'uploads' directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;