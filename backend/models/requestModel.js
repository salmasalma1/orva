const mongoose = require('mongoose');

const requestSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    serviceType: {
      type: String,
      required: [true, 'Please add a service type'],
    },
    vehicleType: {
      type: String,
      required: [true, 'Please add a vehicle type'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    actualCost: {
      type: Number,
      default: 0,
    },
    completionTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create a geospatial index for location-based queries
requestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);
