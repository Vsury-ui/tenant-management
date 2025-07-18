const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Tenant = require('../models/Tenant');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed!'));
    }
  }
});

// Validation middleware
const validateTenant = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address must be at least 5 characters long'),
  body('kyc.aadhaarCard.number').isLength({ min: 12, max: 12 }).withMessage('Aadhaar number must be 12 digits'),
  body('kyc.panCard.number').isLength({ min: 10, max: 10 }).withMessage('PAN number must be 10 characters'),
  body('accommodationFromDate').isISO8601().withMessage('Invalid date format'),
  body('deposit').isNumeric().withMessage('Deposit must be a number'),
  body('contactNumber').matches(/^[6-9]\d{9}$/).withMessage('Invalid contact number'),
  body('monthlyRent').isNumeric().withMessage('Monthly rent must be a number')
];

// Get all tenants
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status !== 'all') {
      query.isActive = status === 'active';
    }
    
    const tenants = await Tenant.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Tenant.countDocuments(query);
    
    res.json({
      tenants,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single tenant
router.get('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new tenant
router.post('/', upload.fields([
  { name: 'aadhaarFile', maxCount: 1 },
  { name: 'panFile', maxCount: 1 },
  { name: 'photoFile', maxCount: 1 }
]), validateTenant, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tenantData = {
      name: req.body.name,
      address: req.body.address,
      kyc: {
        aadhaarCard: {
          number: req.body.kyc.aadhaarCard.number,
          file: req.files.aadhaarFile ? req.files.aadhaarFile[0].filename : ''
        },
        panCard: {
          number: req.body.kyc.panCard.number,
          file: req.files.panFile ? req.files.panFile[0].filename : ''
        }
      },
      accommodationFromDate: req.body.accommodationFromDate,
      deposit: req.body.deposit,
      agreement: {
        isDone: req.body.agreement.isDone === 'true',
        date: req.body.agreement.isDone === 'true' ? req.body.agreement.date : null
      },
      contactNumber: req.body.contactNumber,
      photo: req.files.photoFile ? req.files.photoFile[0].filename : null,
      monthlyRent: req.body.monthlyRent
    };

    const tenant = new Tenant(tenantData);
    await tenant.save();
    
    res.status(201).json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tenant
router.put('/:id', upload.fields([
  { name: 'aadhaarFile', maxCount: 1 },
  { name: 'panFile', maxCount: 1 },
  { name: 'photoFile', maxCount: 1 }
]), validateTenant, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const updateData = {
      name: req.body.name,
      address: req.body.address,
      kyc: {
        aadhaarCard: {
          number: req.body.kyc.aadhaarCard.number,
          file: req.files.aadhaarFile ? req.files.aadhaarFile[0].filename : tenant.kyc.aadhaarCard.file
        },
        panCard: {
          number: req.body.kyc.panCard.number,
          file: req.files.panFile ? req.files.panFile[0].filename : tenant.kyc.panCard.file
        }
      },
      accommodationFromDate: req.body.accommodationFromDate,
      deposit: req.body.deposit,
      agreement: {
        isDone: req.body.agreement.isDone === 'true',
        date: req.body.agreement.isDone === 'true' ? req.body.agreement.date : null
      },
      contactNumber: req.body.contactNumber,
      photo: req.files.photoFile ? req.files.photoFile[0].filename : tenant.photo,
      monthlyRent: req.body.monthlyRent
    };

    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedTenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete tenant
router.delete('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Soft delete - just mark as inactive
    tenant.isActive = false;
    await tenant.save();

    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle tenant status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    tenant.isActive = !tenant.isActive;
    await tenant.save();

    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 