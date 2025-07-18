const mongoose = require('mongoose');

const rentSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  month: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{2}$/.test(v); // Format: YYYY-MM
      },
      message: 'Month must be in YYYY-MM format'
    }
  },
  rentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  lightBillAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'cheque'],
    default: 'cash'
  },
  notes: {
    type: String,
    trim: true
  },
  whatsappSent: {
    type: Boolean,
    default: false
  },
  whatsappSentDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for tenant and month to ensure unique rent records per tenant per month
rentSchema.index({ tenant: 1, month: 1 }, { unique: true });

// Index for better query performance
rentSchema.index({ month: 1 });
rentSchema.index({ status: 1 });
rentSchema.index({ paymentDate: 1 });

module.exports = mongoose.model('Rent', rentSchema); 