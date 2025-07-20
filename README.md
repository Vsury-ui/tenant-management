# Tenant Management Application

A full-stack web application for managing tenants, rent collection, and WhatsApp notifications.

## Features

- **Tenant Management**: Add, edit, and manage tenant information
- **Rent Collection**: Track rent payments and generate monthly reports
- **WhatsApp Integration**: Send payment reminders and confirmations
- **Dashboard**: Visual overview of rent collection status
- **Reports**: Generate detailed reports and analytics

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios for API calls
- Recharts for data visualization

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- WhatsApp Web.js for messaging
- JWT for authentication

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tenant-mangement-app
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp env.example .env
   # Edit .env with your MongoDB URI and other settings
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deployment Summary:

1. **Database**: MongoDB Atlas (Free tier)
2. **Backend**: Render (Free tier)
3. **Frontend**: Vercel (Free tier)

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tenant-management
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5001/api
```

## API Endpoints

### Tenants
- `GET /api/tenants` - Get all tenants
- `POST /api/tenants` - Create new tenant
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Rent
- `GET /api/rent` - Get all rent records
- `POST /api/rent` - Create rent record
- `PATCH /api/rent/:id/mark-paid` - Mark rent as paid
- `GET /api/rent/summary/:month` - Get monthly summary

### WhatsApp
- `GET /api/whatsapp/status` - Get WhatsApp connection status
- `POST /api/whatsapp/send-reminder/:rentId` - Send payment reminder
- `POST /api/whatsapp/send-bulk-reminders` - Send bulk reminders

## Project Structure

```
tenant-mangement-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   └── services/      # API services
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── index.js          # Server entry point
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub. 