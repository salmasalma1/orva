const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMechanics,
  getMechanicById,
  updateMechanicProfile,
} = require('../controllers/mechanicController');

router.route('/').get(getMechanics);
router.route('/:id').get(getMechanicById);

router.route('/profile').put(protect, updateMechanicProfile);

module.exports = router;
