# Tenant Management Application

A comprehensive web application for managing tenants, rent collection, and WhatsApp integration built with React, Node.js, and MongoDB.

## Features

### 🏠 Tenant Management
- **Create/Update/Delete Tenants** with complete information
- **KYC Document Management** - Aadhaar Card and PAN Card uploads
- **Tenant Overview Table** with search and filtering
- **Accommodation Details** - From date, deposit, monthly rent
- **Agreement Tracking** - Status and completion date
- **Contact Information** - Phone numbers and addresses

### 💰 Rent Collection
- **Monthly Rent Records** - Automatic generation for all tenants
- **Payment Status Tracking** - Paid, Pending, Overdue
- **Light Bill Integration** - Separate tracking for utility bills
- **Payment Methods** - Cash, Bank Transfer, UPI, Cheque
- **Rent Collection Dashboard** with summary statistics

### 📱 WhatsApp Integration
- **QR Code Authentication** - Easy WhatsApp Web connection
- **Automated Rent Reminders** - Monthly bulk messaging
- **Payment Confirmations** - Automatic receipts via WhatsApp
- **Custom Messages** - Send personalized messages to tenants
- **Message History** - Track all sent communications

### 📊 Reports & Analytics
- **Financial Reports** - Monthly and yearly revenue tracking
- **Tenant Statistics** - Active/inactive tenants, agreements
- **Payment Analytics** - Collection rates and trends
- **Performance Metrics** - Payment rates and completion rates

## Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **React Hook Form** - Form management and validation
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Multer** - File upload handling
- **WhatsApp Web.js** - WhatsApp integration
- **QRCode** - QR code generation
- **Moment.js** - Date manipulation
- **Express Validator** - Input validation

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tenant-management-app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example file
   cd ../server
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if not running as a service)
   mongod
   
   # Or if using MongoDB Atlas, update the MONGODB_URI in .env
   ```

5. **Start the Application**
   ```bash
   # From the root directory
   npm run dev
   
   # Or start separately:
   # Terminal 1 - Start server
   cd server && npm run dev
   
   # Terminal 2 - Start client
   cd client && npm start
   ```

## Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tenant-management

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./whatsapp-sessions

# JWT Configuration (if needed for future authentication)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Usage

### Getting Started

1. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

2. **WhatsApp Setup**
   - Navigate to the WhatsApp page
   - Scan the QR code with your WhatsApp mobile app
   - Once connected, you can send rent reminders

3. **Add Your First Tenant**
   - Go to Tenants → Add Tenant
   - Fill in all required information
   - Upload KYC documents (Aadhaar and PAN)

4. **Generate Monthly Rent Records**
   - Go to Rent Collection → Generate Monthly
   - Select the month to generate rent records for all active tenants

### Key Workflows

#### Tenant Management
1. **Add Tenant**: Complete tenant registration with KYC documents
2. **Update Information**: Modify tenant details and documents
3. **Track Agreements**: Mark agreement completion status
4. **Manage Status**: Activate/deactivate tenants

#### Rent Collection
1. **Generate Monthly Records**: Create rent records for all tenants
2. **Track Payments**: Mark payments as received
3. **Send Reminders**: Use WhatsApp to send payment reminders
4. **Monitor Status**: View pending and overdue payments

#### WhatsApp Integration
1. **Connect WhatsApp**: Scan QR code to link your WhatsApp
2. **Send Bulk Reminders**: Automatically remind all pending tenants
3. **Send Confirmations**: Confirm payments via WhatsApp
4. **Custom Messages**: Send personalized messages to specific tenants

## API Endpoints

### Tenants
- `GET /api/tenants` - Get all tenants with pagination
- `GET /api/tenants/:id` - Get specific tenant
- `POST /api/tenants` - Create new tenant
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant
- `PATCH /api/tenants/:id/toggle-status` - Toggle tenant status

### Rent Collection
- `GET /api/rent` - Get all rent records
- `GET /api/rent/:id` - Get specific rent record
- `POST /api/rent` - Create rent record
- `PUT /api/rent/:id` - Update rent record
- `PATCH /api/rent/:id/mark-paid` - Mark rent as paid
- `POST /api/rent/generate-monthly` - Generate monthly records
- `GET /api/rent/summary/:month` - Get monthly summary

### WhatsApp
- `GET /api/whatsapp/status` - Get connection status
- `GET /api/whatsapp/qr` - Get QR code for authentication
- `POST /api/whatsapp/send-reminder/:rentId` - Send rent reminder
- `POST /api/whatsapp/send-bulk-reminders` - Send bulk reminders
- `POST /api/whatsapp/send-custom-message` - Send custom message

## File Structure

```
tenant-management-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── index.js       # App entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── uploads/           # File uploads
│   ├── index.js           # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## Features in Detail

### Tenant Information Management
- **Personal Details**: Name, contact number, address
- **KYC Documents**: Aadhaar Card and PAN Card with file uploads
- **Accommodation Details**: From date, deposit amount, monthly rent
- **Agreement Status**: Track agreement completion and dates
- **Status Management**: Active/inactive tenant status

### Rent Collection System
- **Monthly Generation**: Automatically create rent records for all tenants
- **Payment Tracking**: Real-time status updates (paid/pending/overdue)
- **Light Bill Integration**: Separate tracking for utility payments
- **Payment Methods**: Support for multiple payment options
- **Summary Reports**: Monthly and yearly collection summaries

### WhatsApp Integration
- **Easy Setup**: QR code-based WhatsApp Web authentication
- **Automated Messaging**: Bulk rent reminders and confirmations
- **Custom Communication**: Personalized messages to individual tenants
- **Message History**: Track all sent communications
- **Status Monitoring**: Real-time connection status

### Reporting & Analytics
- **Financial Reports**: Comprehensive revenue tracking
- **Tenant Analytics**: Statistics on tenant management
- **Performance Metrics**: Payment rates and completion rates
- **Yearly Comparisons**: Historical data analysis

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

- [ ] User authentication and authorization
- [ ] Advanced reporting with charts
- [ ] Email notifications
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Data export functionality
- [ ] Backup and restore features 