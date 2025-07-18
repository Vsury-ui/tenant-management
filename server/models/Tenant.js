const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  kyc: {
    aadhaarCard: {
      number: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: function(v) {
            return /^\d{12}$/.test(v);
          },
          message: 'Aadhaar number must be 12 digits'
        }
      },
      file: {
        type: String,
        required: true
      }
    },
    panCard: {
      number: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: function(v) {
            return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
          },
          message: 'PAN number must be in correct format (e.g., ABCDE1234F)'
        }
      },
      file: {
        type: String,
        required: true
      }
    }
  },
  accommodationFromDate: {
    type: Date,
    required: true
  },
  deposit: {
    type: Number,
    required: true,
    min: 0
  },
  agreement: {
    isDone: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date,
      default: null
    }
  },
  contactNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Contact number must be a valid 10-digit Indian mobile number'
    }
  },
  photo: {
    type: String,
    default: null
  },
  monthlyRent: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
tenantSchema.index({ name: 1 });
tenantSchema.index({ contactNumber: 1 });
tenantSchema.index({ 'kyc.aadhaarCard.number': 1 });
tenantSchema.index({ 'kyc.panCard.number': 1 });

module.exports = mongoose.model('Tenant', tenantSchema); 