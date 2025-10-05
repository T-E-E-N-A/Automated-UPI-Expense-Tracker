# Automated-UPI-Expense-Tracker

# 🚀 Complete Expense Tracker Setup Guide

## ✅ **What's Fixed & Integrated**

### **Frontend-Backend Integration**
- ✅ Real API calls instead of mock data
- ✅ Clerk authentication with backend user creation
- ✅ Add Expense/Income forms with database storage
- ✅ User data persistence in MongoDB
- ✅ Real-time data updates

### **New Features Added**
- ✅ **Add Expense Form**: Create new expenses with categories
- ✅ **Add Income Form**: Track income sources
- ✅ **Real Database**: MongoDB integration with user data
- ✅ **Clerk Integration**: Automatic user creation in backend
- ✅ **API Service**: Complete CRUD operations

## 🔧 **Setup Instructions**

### **1. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with these variables:
```

**Backend `.env` file:**
```env
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Start Backend:**
```bash
npm run dev
```

### **2. Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file with these variables:
```

**Frontend `.env.local` file:**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
VITE_API_URL=http://localhost:5000/api
```

**Start Frontend:**
```bash
npm run dev
```

### **3. MongoDB Setup**

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

**Option 2: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in backend `.env`

**Option 3: Docker MongoDB**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### **4. Clerk Setup**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy your publishable key
4. Add it to `frontend/.env.local`
5. Update redirect URLs in Clerk dashboard:
   - Sign-in URL: `http://localhost:5173/sign-in`
   - Sign-up URL: `http://localhost:5173/sign-up`
   - After sign-in: `http://localhost:5173/dashboard`

## 🎯 **How It Works Now**

### **User Authentication Flow**
1. **User signs in with Clerk** (Google, email, etc.)
2. **Frontend automatically creates user in backend** via API
3. **User data is stored in MongoDB** with Clerk ID
4. **All expenses/income are linked to user** in database

### **Data Flow**
1. **Add Expense/Income**: Forms save to MongoDB via API
2. **Dashboard**: Shows real data from database
3. **Charts**: Display actual user data
4. **Persistence**: Data survives page refreshes and logins

### **New Features Available**
- ✅ **+ Add Expense** button on dashboard
- ✅ **+ Add Income** button on dashboard
- ✅ **Real-time updates** when adding data
- ✅ **User-specific data** (each user sees only their data)
- ✅ **Database persistence** (data saved permanently)

## 📊 **API Endpoints Available**

### **Authentication**
- `POST /api/auth/create-user` - Create user from Clerk
- `GET /api/auth/me` - Get user profile

### **Expenses**
- `GET /api/expenses` - Get user expenses
- `POST /api/expenses/add` - Add new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### **Income**
- `GET /api/income` - Get user income
- `POST /api/income/add` - Add new income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### **Dashboard**
- `GET /api/dashboard/summary` - Get dashboard data
- `GET /api/dashboard/expense-categories` - Get expense categories
- `GET /api/dashboard/income-sources` - Get income sources

## 🎉 **What You Can Do Now**

### **1. Sign Up/Login**
- Use Google, email, or any Clerk method
- User automatically created in backend database

### **2. Add Expenses**
- Click "+ Add" button on dashboard
- Fill expense form with category, merchant, amount
- Data saved to MongoDB

### **3. Add Income**
- Click "+ Add" button on dashboard
- Fill income form with source and amount
- Data saved to MongoDB

### **4. View Data**
- Dashboard shows real data from database
- Charts display actual user data
- All data persists between sessions

### **5. View Detailed Data**
- Expenses page shows all user expenses
- Income page shows all user income
- Data is user-specific and secure

## 🔍 **Testing the Integration**

### **1. Start Both Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### **2. Test User Flow**
1. Go to `http://localhost:5173`
2. Sign up with Google/email
3. User should be created in backend database
4. Add an expense using "+ Add" button
5. Check MongoDB to see the data
6. Refresh page - data should persist

### **3. Verify Database**
- Check MongoDB for `users` collection
- Check MongoDB for `expenses` collection  
- Check MongoDB for `income` collection
- All data should be linked to your user

## 🚨 **Troubleshooting**

### **Common Issues**
1. **"Cannot reach site"**: Check if backend is running on port 5000
2. **"User not found"**: Check Clerk key configuration
3. **"Database connection failed"**: Check MongoDB is running
4. **"CORS error"**: Check FRONTEND_URL in backend .env

### **Check Logs**
- Backend logs: Check terminal running `npm run dev`
- Frontend logs: Check browser console
- Database logs: Check MongoDB logs

## 🎯 **Next Steps**

Your Expense Tracker is now fully functional with:
- ✅ Real database integration
- ✅ User authentication with Clerk
- ✅ Add/edit/delete expenses and income
- ✅ Persistent data storage
- ✅ User-specific data isolation
- ✅ Professional UI with forms

**You can now:**
1. Add real expenses and income
2. See data persist between sessions
3. Have multiple users with separate data
4. Scale to production with proper hosting

The application is ready for real-world use! 🎉
