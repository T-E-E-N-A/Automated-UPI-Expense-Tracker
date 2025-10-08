# Expense Tracker Backend API

A comprehensive MERN stack backend for the Expense Tracker application with JWT authentication, MongoDB integration, and ML-powered features.

## 🚀 Features

### Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Protected routes with middleware
- User registration, login, and profile management
- Secure password validation

### Financial Management
- **Expense Tracking**: Add, update, delete, and categorize expenses
- **Income Management**: Track income from various sources
- **Budget Management**: Set monthly limits with alert thresholds
- **Dashboard Analytics**: Comprehensive financial overview

### Advanced Features
- **ML Integration**: AI-powered expense categorization and spending predictions
- **Smart Notifications**: Overspending alerts and budget warnings
- **Detailed Reports**: Category-wise, monthly, and trend analysis
- **Data Visualization**: Charts and analytics for better insights

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Validation**: express-validator
- **ML Integration**: Axios for external ML service calls

## 📁 Project Structure

```
backend/
├── models/                 # MongoDB models
│   ├── User.js            # User schema
│   ├── Expense.js         # Expense schema
│   ├── Income.js          # Income schema
│   └── Budget.js          # Budget schema
├── routes/                 # API routes
│   ├── auth.js            # Authentication routes
│   ├── expenses.js        # Expense management
│   ├── income.js          # Income management
│   ├── dashboard.js       # Dashboard analytics
│   ├── reports.js         # Financial reports
│   ├── ml.js              # ML integration
│   ├── notifications.js   # Alert system
│   └── budget.js          # Budget management
├── middleware/             # Custom middleware
│   ├── auth.js            # JWT authentication
│   └── validation.js      # Request validation
├── server.js              # Main server file
├── package.json           # Dependencies
└── README.md             # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

5. **Verify installation**
   ```bash
   curl http://localhost:5000/api/health
   ```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |
| DELETE | `/api/auth/account` | Delete account | Yes |

### Expense Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/expenses/add` | Add new expense | Yes |
| GET | `/api/expenses/list` | Get expenses (paginated) | Yes |
| GET | `/api/expenses/:id` | Get single expense | Yes |
| PUT | `/api/expenses/:id` | Update expense | Yes |
| DELETE | `/api/expenses/:id` | Delete expense | Yes |
| GET | `/api/expenses/recent` | Get recent expenses | Yes |
| GET | `/api/expenses/categories/list` | Get categories | Yes |

### Income Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/income/add` | Add new income | Yes |
| GET | `/api/income/list` | Get income (paginated) | Yes |
| GET | `/api/income/:id` | Get single income | Yes |
| PUT | `/api/income/:id` | Update income | Yes |
| DELETE | `/api/income/:id` | Delete income | Yes |
| GET | `/api/income/recent` | Get recent income | Yes |
| GET | `/api/income/sources/list` | Get sources | Yes |

### Dashboard & Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/summary` | Financial summary | Yes |
| GET | `/api/dashboard/expenses/recent` | Recent expenses | Yes |
| GET | `/api/dashboard/income/recent` | Recent income | Yes |
| GET | `/api/dashboard/expenses/categories` | Expenses by category | Yes |
| GET | `/api/dashboard/income/sources` | Income by source | Yes |
| GET | `/api/dashboard/trends/monthly` | Monthly trends | Yes |

### Reports & Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reports/category` | Category-wise expenses | Yes |
| GET | `/api/reports/income/source` | Source-wise income | Yes |
| GET | `/api/reports/monthly/expenses` | Monthly expense trends | Yes |
| GET | `/api/reports/monthly/income` | Monthly income trends | Yes |
| GET | `/api/reports/daily/expenses` | Daily expense trends | Yes |
| GET | `/api/reports/merchant/top` | Top merchants | Yes |

### Budget Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/budget` | Get budget info | Yes |
| PUT | `/api/budget` | Update budget | Yes |
| POST | `/api/budget/reset` | Reset monthly budget | Yes |
| GET | `/api/budget/status` | Get budget status | Yes |

### ML & AI Features

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ml/categorize` | AI expense categorization | Yes |
| POST | `/api/ml/predict` | Spending prediction | Yes |
| GET | `/api/ml/insights` | AI-powered insights | Yes |

### Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications/alerts` | Get spending alerts | Yes |
| POST | `/api/notifications/send` | Send notification | Yes |
| GET | `/api/notifications/settings` | Get notification settings | Yes |
| PUT | `/api/notifications/settings` | Update settings | Yes |
| POST | `/api/notifications/mark-read` | Mark alerts as read | Yes |

## 🔧 Configuration

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# ML Service (Optional)
ML_SERVICE_URL=http://localhost:8000
ML_API_KEY=your_ml_api_key_here
```

### Database Models

#### User Model
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  createdAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
```

#### Expense Model
```javascript
{
  userId: ObjectId,
  date: Date,
  category: String,
  merchant: String,
  upiId: String,
  amount: Number,
  notes: String,
  paymentMethod: String,
  tags: [String]
}
```

#### Income Model
```javascript
{
  userId: ObjectId,
  date: Date,
  source: String,
  amount: Number,
  notes: String,
  tags: [String]
}
```

#### Budget Model
```javascript
{
  userId: ObjectId,
  monthlyLimit: Number,
  currentMonthSpent: Number,
  alertThresholds: {
    warning: Number,
    critical: Number
  },
  alertsTriggered: Number
}
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin policies
- **Error Handling**: Secure error responses
- **Rate Limiting**: Built-in protection against abuse

## 📊 Data Validation

All endpoints include comprehensive validation:
- **Email Format**: Valid email addresses
- **Password Strength**: Minimum requirements
- **Amount Validation**: Positive numbers with limits
- **Date Validation**: ISO 8601 format
- **Category/Source**: Predefined enum values
- **Pagination**: Reasonable limits and offsets

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
   JWT_SECRET=your_production_secret_key
   ```

2. **Build and Start**
   ```bash
   npm start
   ```

3. **Process Management** (using PM2)
   ```bash
   npm install -g pm2
   pm2 start server.js --name expense-tracker-api
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test specific endpoints
curl -X GET http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Aggregation Pipelines**: Efficient data processing
- **Pagination**: Memory-efficient large dataset handling
- **Caching**: Strategic caching for frequently accessed data
- **Connection Pooling**: Optimized database connections

## 🔧 Development

### Adding New Features

1. **Create Model** (if needed)
2. **Add Routes** in appropriate route file
3. **Implement Middleware** for validation/auth
4. **Update Documentation**
5. **Test Thoroughly**

### Code Style

- **ES6+ Features**: Modern JavaScript
- **Async/Await**: Promise-based async handling
- **Error Handling**: Comprehensive try-catch blocks
- **Validation**: Input sanitization and validation
- **Documentation**: Clear comments and JSDoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs for debugging

## 🔄 API Versioning

Current API version: v1
- All endpoints are prefixed with `/api/`
- Backward compatibility maintained
- Version headers for future API versions

---

**Built with ❤️ for efficient expense tracking and financial management.**
