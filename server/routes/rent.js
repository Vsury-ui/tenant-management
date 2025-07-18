const express = require('express');
const { body, validationResult } = require('express-validator');
const Rent = require('../models/Rent');
const Tenant = require('../models/Tenant');
const moment = require('moment');

const router = express.Router();

// Validation middleware
const validateRent = [
  body('tenant').isMongoId().withMessage('Valid tenant ID is required'),
  body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
  body('rentAmount').isNumeric().withMessage('Rent amount must be a number'),
  body('lightBillAmount').optional().isNumeric().withMessage('Light bill amount must be a number'),
  body('paymentMethod').optional().isIn(['cash', 'bank_transfer', 'upi', 'cheque']).withMessage('Invalid payment method')
];

// Get all rent records with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      month = '', 
      status = 'all', 
      tenant = '' 
    } = req.query;
    
    let query = {};
    
    // Month filter
    if (month) {
      query.month = month;
    }
    
    // Status filter
    if (status !== 'all') {
      query.status = status;
    }
    
    // Tenant filter
    if (tenant) {
      query.tenant = tenant;
    }
    
    const rentRecords = await Rent.find(query)
      .populate('tenant', 'name contactNumber')
      .sort({ month: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Rent.countDocuments(query);
    
    res.json({
      rentRecords,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get rent record by ID
router.get('/:id', async (req, res) => {
  try {
    const rentRecord = await Rent.findById(req.params.id).populate('tenant');
    if (!rentRecord) {
      return res.status(404).json({ error: 'Rent record not found' });
    }
    res.json(rentRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new rent record
router.post('/', validateRent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if tenant exists
    const tenant = await Tenant.findById(req.body.tenant);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Check if rent record already exists for this tenant and month
    const existingRent = await Rent.findOne({
      tenant: req.body.tenant,
      month: req.body.month
    });

    if (existingRent) {
      return res.status(400).json({ error: 'Rent record already exists for this tenant and month' });
    }

    const rentData = {
      tenant: req.body.tenant,
      month: req.body.month,
      rentAmount: req.body.rentAmount,
      lightBillAmount: req.body.lightBillAmount || 0,
      totalAmount: req.body.rentAmount + (req.body.lightBillAmount || 0),
      paymentMethod: req.body.paymentMethod || 'cash',
      notes: req.body.notes
    };

    const rentRecord = new Rent(rentData);
    await rentRecord.save();
    
    const populatedRecord = await Rent.findById(rentRecord._id).populate('tenant');
    res.status(201).json(populatedRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update rent record
router.put('/:id', validateRent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const rentRecord = await Rent.findById(req.params.id);
    if (!rentRecord) {
      return res.status(404).json({ error: 'Rent record not found' });
    }

    const updateData = {
      rentAmount: req.body.rentAmount,
      lightBillAmount: req.body.lightBillAmount || 0,
      totalAmount: req.body.rentAmount + (req.body.lightBillAmount || 0),
      paymentMethod: req.body.paymentMethod || 'cash',
      notes: req.body.notes
    };

    const updatedRecord = await Rent.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('tenant');

    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark rent as paid
router.patch('/:id/mark-paid', async (req, res) => {
  try {
    const rentRecord = await Rent.findById(req.params.id);
    if (!rentRecord) {
      return res.status(404).json({ error: 'Rent record not found' });
    }

    rentRecord.status = 'paid';
    rentRecord.paymentDate = new Date();
    rentRecord.paymentMethod = req.body.paymentMethod || rentRecord.paymentMethod;
    
    await rentRecord.save();
    
    const updatedRecord = await Rent.findById(rentRecord._id).populate('tenant');
    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete rent record
router.delete('/:id', async (req, res) => {
  try {
    const rentRecord = await Rent.findById(req.params.id);
    if (!rentRecord) {
      return res.status(404).json({ error: 'Rent record not found' });
    }

    await Rent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rent record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate monthly rent records for all active tenants
router.post('/generate-monthly', async (req, res) => {
  try {
    const { month } = req.body;
    
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Valid month in YYYY-MM format is required' });
    }

    // Get all active tenants
    const activeTenants = await Tenant.find({ isActive: true });
    
    const generatedRecords = [];
    const errors = [];

    for (const tenant of activeTenants) {
      try {
        // Check if rent record already exists
        const existingRent = await Rent.findOne({
          tenant: tenant._id,
          month: month
        });

        if (!existingRent) {
          const rentRecord = new Rent({
            tenant: tenant._id,
            month: month,
            rentAmount: tenant.monthlyRent,
            lightBillAmount: 0,
            totalAmount: tenant.monthlyRent,
            status: 'pending'
          });

          await rentRecord.save();
          generatedRecords.push(rentRecord);
        }
      } catch (error) {
        errors.push(`Failed to generate rent record for ${tenant.name}: ${error.message}`);
      }
    }

    res.json({
      message: `Generated ${generatedRecords.length} rent records for ${month}`,
      generatedRecords,
      errors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly summary
router.get('/summary/:month', async (req, res) => {
  try {
    const { month } = req.params;
    
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Valid month in YYYY-MM format is required' });
    }

    const rentRecords = await Rent.find({ month }).populate('tenant');
    
    const summary = {
      month,
      totalRecords: rentRecords.length,
      totalRentAmount: 0,
      totalLightBillAmount: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      statusBreakdown: {
        paid: 0,
        pending: 0,
        overdue: 0
      }
    };

    rentRecords.forEach(record => {
      summary.totalRentAmount += record.rentAmount;
      summary.totalLightBillAmount += record.lightBillAmount;
      summary.totalAmount += record.totalAmount;
      summary.statusBreakdown[record.status]++;
      
      if (record.status === 'paid') {
        summary.paidAmount += record.totalAmount;
      } else if (record.status === 'pending') {
        summary.pendingAmount += record.totalAmount;
      } else if (record.status === 'overdue') {
        summary.overdueAmount += record.totalAmount;
      }
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overdue rent records
router.get('/overdue/list', async (req, res) => {
  try {
    const currentMonth = moment().format('YYYY-MM');
    const overdueRecords = await Rent.find({
      status: 'pending',
      month: { $lt: currentMonth }
    }).populate('tenant');

    res.json(overdueRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 