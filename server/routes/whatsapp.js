const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const Rent = require('../models/Rent');
const Tenant = require('../models/Tenant');
const moment = require('moment');

const router = express.Router();

// WhatsApp client instance
let whatsappClient = null;
let qrCodeData = null;
let isClientReady = false;

// Initialize WhatsApp client
const initializeWhatsApp = () => {
  if (whatsappClient) return;

  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  whatsappClient.on('qr', async (qr) => {
    try {
      qrCodeData = await qrcode.toDataURL(qr);
      console.log('QR Code generated for WhatsApp authentication');
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  });

  whatsappClient.on('ready', () => {
    isClientReady = true;
    console.log('WhatsApp client is ready!');
  });

  whatsappClient.on('disconnected', () => {
    isClientReady = false;
    console.log('WhatsApp client disconnected');
  });

  whatsappClient.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failed:', msg);
    isClientReady = false;
  });

  whatsappClient.initialize();
};

// Initialize WhatsApp on server start
initializeWhatsApp();

// Get WhatsApp connection status
router.get('/status', (req, res) => {
  res.json({
    isReady: isClientReady,
    hasQR: !!qrCodeData
  });
});

// Get QR code for authentication
router.get('/qr', (req, res) => {
  if (!qrCodeData) {
    return res.status(404).json({ error: 'QR code not available' });
  }
  res.json({ qrCode: qrCodeData });
});

// Send rent reminder to a specific tenant
router.post('/send-reminder/:rentId', async (req, res) => {
  try {
    if (!isClientReady) {
      return res.status(400).json({ error: 'WhatsApp client is not ready' });
    }

    const rentRecord = await Rent.findById(req.params.rentId).populate('tenant');
    if (!rentRecord) {
      return res.status(404).json({ error: 'Rent record not found' });
    }

    const { tenant } = rentRecord;
    const phoneNumber = `91${tenant.contactNumber}`; // Add India country code

    const message = `Dear ${tenant.name},

This is a reminder for your rent payment for ${moment(rentRecord.month, 'YYYY-MM').format('MMMM YYYY')}.

Details:
• Rent Amount: ₹${rentRecord.rentAmount}
• Light Bill: ₹${rentRecord.lightBillAmount}
• Total Amount: ₹${rentRecord.totalAmount}
• Due Date: ${moment(rentRecord.month, 'YYYY-MM').endOf('month').format('DD/MM/YYYY')}

Please make the payment at your earliest convenience.

Thank you!`;

    const chatId = `${phoneNumber}@c.us`;
    await whatsappClient.sendMessage(chatId, message);

    // Update rent record
    rentRecord.whatsappSent = true;
    rentRecord.whatsappSentDate = new Date();
    await rentRecord.save();

    res.json({ 
      message: 'Rent reminder sent successfully',
      sentTo: tenant.name,
      phoneNumber: tenant.contactNumber
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send rent reminder to all pending tenants for a specific month
router.post('/send-bulk-reminders', async (req, res) => {
  try {
    if (!isClientReady) {
      return res.status(400).json({ error: 'WhatsApp client is not ready' });
    }

    const { month } = req.body;
    
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Valid month in YYYY-MM format is required' });
    }

    const pendingRents = await Rent.find({
      month,
      status: 'pending',
      whatsappSent: false
    }).populate('tenant');

    const results = {
      sent: [],
      failed: [],
      total: pendingRents.length
    };

    for (const rentRecord of pendingRents) {
      try {
        const { tenant } = rentRecord;
        const phoneNumber = `91${tenant.contactNumber}`;

        const message = `Dear ${tenant.name},

This is a reminder for your rent payment for ${moment(rentRecord.month, 'YYYY-MM').format('MMMM YYYY')}.

Details:
• Rent Amount: ₹${rentRecord.rentAmount}
• Light Bill: ₹${rentRecord.lightBillAmount}
• Total Amount: ₹${rentRecord.totalAmount}
• Due Date: ${moment(rentRecord.month, 'YYYY-MM').endOf('month').format('DD/MM/YYYY')}

Please make the payment at your earliest convenience.

Thank you!`;

        const chatId = `${phoneNumber}@c.us`;
        await whatsappClient.sendMessage(chatId, message);

        // Update rent record
        rentRecord.whatsappSent = true;
        rentRecord.whatsappSentDate = new Date();
        await rentRecord.save();

        results.sent.push({
          tenantName: tenant.name,
          phoneNumber: tenant.contactNumber,
          rentId: rentRecord._id
        });
      } catch (error) {
        results.failed.push({
          tenantName: rentRecord.tenant.name,
          phoneNumber: rentRecord.tenant.contactNumber,
          rentId: rentRecord._id,
          error: error.message
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error sending bulk WhatsApp messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send payment confirmation
router.post('/send-payment-confirmation/:rentId', async (req, res) => {
  try {
    if (!isClientReady) {
      return res.status(400).json({ error: 'WhatsApp client is not ready' });
    }

    const rentRecord = await Rent.findById(req.params.rentId).populate('tenant');
    if (!rentRecord) {
      return res.status(404).json({ error: 'Rent record not found' });
    }

    if (rentRecord.status !== 'paid') {
      return res.status(400).json({ error: 'Rent is not marked as paid' });
    }

    const { tenant } = rentRecord;
    const phoneNumber = `91${tenant.contactNumber}`;

    const message = `Dear ${tenant.name},

Thank you for your rent payment for ${moment(rentRecord.month, 'YYYY-MM').format('MMMM YYYY')}.

Payment Confirmation:
• Rent Amount: ₹${rentRecord.rentAmount}
• Light Bill: ₹${rentRecord.lightBillAmount}
• Total Amount: ₹${rentRecord.totalAmount}
• Payment Date: ${moment(rentRecord.paymentDate).format('DD/MM/YYYY')}
• Payment Method: ${rentRecord.paymentMethod}

Your payment has been received and recorded.

Thank you!`;

    const chatId = `${phoneNumber}@c.us`;
    await whatsappClient.sendMessage(chatId, message);

    res.json({ 
      message: 'Payment confirmation sent successfully',
      sentTo: tenant.name,
      phoneNumber: tenant.contactNumber
    });
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send custom message to a tenant
router.post('/send-custom-message', async (req, res) => {
  try {
    if (!isClientReady) {
      return res.status(400).json({ error: 'WhatsApp client is not ready' });
    }

    const { tenantId, message } = req.body;

    if (!tenantId || !message) {
      return res.status(400).json({ error: 'Tenant ID and message are required' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const phoneNumber = `91${tenant.contactNumber}`;
    const chatId = `${phoneNumber}@c.us`;
    
    await whatsappClient.sendMessage(chatId, message);

    res.json({ 
      message: 'Custom message sent successfully',
      sentTo: tenant.name,
      phoneNumber: tenant.contactNumber
    });
  } catch (error) {
    console.error('Error sending custom message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get WhatsApp message history for a tenant
router.get('/history/:tenantId', async (req, res) => {
  try {
    const rentRecords = await Rent.find({
      tenant: req.params.tenantId,
      whatsappSent: true
    }).populate('tenant').sort({ whatsappSentDate: -1 });

    const history = rentRecords.map(record => ({
      month: record.month,
      messageType: record.status === 'paid' ? 'Payment Confirmation' : 'Rent Reminder',
      sentDate: record.whatsappSentDate,
      rentAmount: record.rentAmount,
      lightBillAmount: record.lightBillAmount,
      totalAmount: record.totalAmount
    }));

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout WhatsApp client
router.post('/logout', async (req, res) => {
  try {
    if (whatsappClient) {
      await whatsappClient.destroy();
      whatsappClient = null;
      isClientReady = false;
      qrCodeData = null;
    }
    res.json({ message: 'WhatsApp client logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 