const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getMechanics,
  deleteUser,
  getAllUsers,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.post(
  '/register',
  upload.single('photo'),
  registerUser
);

router.post(
  '/login',
  loginUser
);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('photo'), updateUserProfile);

// Get all mechanics
router.get('/mechanics', getMechanics);

// Admin routes
router.get('/', protect, getAllUsers);
router.delete('/:id', protect, deleteUser);

module.exports = router;
