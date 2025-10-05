# 🚀 Complete Setup Guide

## Frontend Setup (Fixed PostCSS Issue)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
Create `.env.local` in the `frontend` directory:
```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Frontend
```bash
npm run dev
```

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
Create `.env` in the `backend` directory:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
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

### 4. Start Backend
```bash
npm run dev
```

### Environment Variables Required

**Frontend (.env.local):**
- `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

**Backend (.env):**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (minimum 32 characters)
- `JWT_EXPIRE` - Token expiration time (e.g., 7d, 30d)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `ML_SERVICE_URL` - ML service URL (optional)
- `ML_API_KEY` - ML service API key (optional)

## 🎯 Quick Start Commands

### Terminal 1 (Backend)
```bash
cd backend
npm install
# Add your .env file with the variables above
npm run dev
```

### Terminal 2 (Frontend)
```bash
cd frontend
npm install
# Add your .env.local file with Clerk key
npm run dev
```

## 🔑 Getting Your Clerk Key

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Go to "API Keys" section
4. Copy the "Publishable key"
5. Add it to your `frontend/.env.local` file

## 📊 MongoDB Setup Options

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in backend `.env`

## ✅ Verification

### Frontend
- Open http://localhost:5173
- Should show Clerk sign-in page
- No PostCSS errors in console

### Backend
- Open http://localhost:5000/api/health
- Should return: `{"status":"OK","message":"Expense Tracker API is running"}`


### Common Issues
1. **Clerk Key Missing**: Add your Clerk publishable key to `.env.local`
2. **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
3. **Port Conflicts**: Change PORT in backend `.env` if 5000 is occupied
4. **CORS Issues**: Ensure `FRONTEND_URL` matches your frontend URL

## 🎉 You're Ready!

Both frontend and backend should now work without PostCSS errors. The application includes:
- ✅ Clerk authentication
- ✅ Responsive design with Tailwind CSS
- ✅ Expense and income tracking
- ✅ Interactive charts
- ✅ Mobile-friendly interface
