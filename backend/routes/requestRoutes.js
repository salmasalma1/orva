const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  createRequest,
  getMyRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
  getMechanicRequests,
  updateRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to all routes
router.use(protect);

// User routes
router.route('/')
  .post(
    [
      check('serviceType', 'Service type is required').not().isEmpty(),
      check('vehicleType', 'Vehicle type is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('location', 'Location is required').isObject(),
      check('location.coordinates', 'Location coordinates are required').isArray({ min: 2 }),
    ],
    createRequest
  )
  .get(getMyRequests);

// Mechanic routes
router.get('/mechanic', getMechanicRequests);

// Common routes
router.route('/:id')
  .get(getRequestById)
  .put(
    [
      check('status', 'Status is required')
        .isIn(['pending', 'accepted', 'in-progress', 'completed', 'cancelled']),
    ],
    updateRequestStatus
  )
  .delete(deleteRequest);

// Update request details (for mechanics)
router.put('/:id/update', updateRequest);

module.exports = router;
