# 🆓 Free Deployment Guide (No Domain Required)

This guide will help you deploy your app completely FREE using free subdomains provided by hosting platforms.

---

## 📋 What You Already Have

✅ MongoDB Atlas (free tier)  
✅ Clerk account with publishable key (`pk_test_...`)  
✅ Local development working

---

## 🔑 Step 1: Get Your Clerk Secret Key

You need the **Secret Key** (not just publishable key) for backend authentication.

### How to Get Clerk Secret Key:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to **API Keys** (in left sidebar)
4. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_...`) - ✅ You have this
   - **Secret Key** (starts with `sk_test_...`) - ❌ You need this
5. Click **Show** or **Copy** next to the Secret Key
6. **Save this key** - you'll need it for backend deployment

**Note**: For production, you'll use `pk_live_...` and `sk_live_...` keys, but for now `pk_test_...` and `sk_test_...` work fine for testing.

---

## 🗄️ Step 2: Get Your MongoDB Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `expense-tracker` (or leave as is)

**Example:**
```
mongodb+srv://username:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

---

## 🖥️ Step 3: Deploy Backend (FREE on Railway)

### 3.1 Create Railway Account

1. Go to [Railway.app](https://railway.app/)
2. Click **Start a New Project**
3. Sign up with **GitHub** (free)
4. Railway gives you **$5 free credit** every month (enough for small apps)

### 3.2 Deploy Your Backend

1. In Railway dashboard, click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your repository: `Automated-UPI-Expense-Tracker`
4. Railway will detect it's a Node.js project

### 3.3 Configure Backend Settings

1. Click on your deployed service
2. Go to **Settings** tab
3. Set **Root Directory** to: `backend`
4. Set **Start Command** to: `npm start`
5. Railway will auto-detect the rest

### 3.4 Add Environment Variables

1. In Railway, go to **Variables** tab
2. Click **+ New Variable**
3. Add these **ONE BY ONE**:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

```env
JWT_SECRET=any_random_string_at_least_32_characters_long_like_this_one_12345
```

```env
JWT_EXPIRE=7d
```

```env
PORT=5000
```

```env
NODE_ENV=production
```

```env
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
```

**Important**: 
- Replace `MONGODB_URI` with your actual MongoDB connection string
- Replace `CLERK_SECRET_KEY` with your Clerk secret key from Step 1
- For `FRONTEND_URL`, we'll add it after deploying frontend

### 3.5 Get Your Backend URL

1. After deployment, Railway will give you a URL like:
   ```
   https://your-app-name.up.railway.app
   ```
2. **Copy this URL** - you'll need it for frontend
3. Test it: Visit `https://your-backend-url.up.railway.app/api/health`
   - Should show: `{"status":"OK","message":"Expense Tracker API is running"}`

### 3.6 Update Frontend URL in Backend

1. Go back to Railway **Variables**
2. Add one more variable:

```env
FRONTEND_URL=https://your-frontend-url.vercel.app
```

(We'll get the frontend URL in next step, come back and add this)

---

## 🎨 Step 4: Deploy Frontend (FREE on Vercel)

### 4.1 Create Vercel Account

1. Go to [Vercel.com](https://vercel.com/)
2. Click **Sign Up**
3. Sign up with **GitHub** (free forever)
4. Vercel is completely free for personal projects

### 4.2 Deploy Your Frontend

1. In Vercel dashboard, click **Add New Project**
2. Import your GitHub repository: `Automated-UPI-Expense-Tracker`
3. Configure project:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend` (IMPORTANT!)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
4. Click **Deploy**

### 4.3 Add Environment Variables

1. After deployment starts, go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Add these variables:

**Variable 1:**
- **Name**: `VITE_CLERK_PUBLISHABLE_KEY`
- **Value**: `pk_test_your_publishable_key_here`
- **Environment**: Production, Preview, Development (select all)

**Variable 2:**
- **Name**: `VITE_API_URL`
- **Value**: `https://your-backend-url.up.railway.app/api`
- **Environment**: Production, Preview, Development (select all)
- **Important**: Replace `your-backend-url.up.railway.app` with your actual Railway backend URL from Step 3.5

### 4.4 Redeploy Frontend

1. After adding environment variables, go to **Deployments** tab
2. Click the **3 dots** (⋯) on latest deployment
3. Click **Redeploy**
4. This will rebuild with new environment variables

### 4.5 Get Your Frontend URL

1. After deployment, Vercel gives you a URL like:
   ```
   https://your-app-name.vercel.app
   ```
2. **Copy this URL**
3. Visit it - your app should load!

---

## 🔄 Step 5: Update Clerk Settings

### 5.1 Add Production Domains to Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Add your **Vercel frontend URL**: `your-app-name.vercel.app`
6. Click **Save**

### 5.2 Update Redirect URLs

1. Still in Clerk Dashboard, go to **Settings** → **Paths**
2. Update these URLs:

**Sign-in redirect URL:**
```
https://your-app-name.vercel.app/dashboard
```

**Sign-up redirect URL:**
```
https://your-app-name.vercel.app/dashboard
```

**After sign-in redirect:**
```
https://your-app-name.vercel.app/dashboard
```

Replace `your-app-name.vercel.app` with your actual Vercel URL.

### 5.3 Update Backend Frontend URL

1. Go back to **Railway** → Your backend service → **Variables**
2. Update or add:

```env
FRONTEND_URL=https://your-app-name.vercel.app
```

Replace with your actual Vercel URL.

3. Railway will auto-redeploy with new variable

---

## ✅ Step 6: Test Everything

### 6.1 Test Backend

Visit: `https://your-backend-url.up.railway.app/api/health`

Should show:
```json
{
  "status": "OK",
  "message": "Expense Tracker API is running",
  "timestamp": "..."
}
```

### 6.2 Test Frontend

1. Visit: `https://your-app-name.vercel.app`
2. Try to **Sign Up** or **Sign In**
3. Should work with Clerk authentication
4. Try adding an expense
5. Check if it saves to MongoDB

### 6.3 Verify Database

1. Go to MongoDB Atlas
2. Click **Browse Collections**
3. You should see:
   - `users` collection (with your user)
   - `expenses` collection (with your test expense)
   - `income` collection

---

## 🔧 Troubleshooting

### Problem: Backend not starting

**Solution:**
1. Check Railway **Logs** tab
2. Verify all environment variables are set
3. Check MongoDB connection string is correct
4. Make sure `CLERK_SECRET_KEY` starts with `sk_test_` or `sk_live_`

### Problem: CORS errors in browser

**Solution:**
1. Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. Should be: `https://your-app-name.vercel.app` (no trailing slash)
3. Redeploy backend after updating

### Problem: Clerk authentication not working

**Solution:**
1. Verify `VITE_CLERK_PUBLISHABLE_KEY` in Vercel is correct
2. Check Clerk dashboard → Domains → Your Vercel domain is added
3. Verify redirect URLs in Clerk dashboard
4. Make sure you're using the same Clerk app in both frontend and backend

### Problem: API calls failing (404 or network error)

**Solution:**
1. Check `VITE_API_URL` in Vercel:
   - Should be: `https://your-backend-url.up.railway.app/api`
   - Make sure `/api` is at the end
   - No trailing slash
2. Redeploy frontend after updating `VITE_API_URL`
3. Check browser console for exact error

### Problem: Database connection failed

**Solution:**
1. Go to MongoDB Atlas → **Network Access**
2. Make sure **0.0.0.0/0** is allowed (allows all IPs)
3. Verify connection string has correct password
4. Check Railway logs for specific error

---

## 📝 Quick Checklist

Before deploying, make sure you have:

- [ ] Clerk Secret Key (`sk_test_...`)
- [ ] MongoDB connection string
- [ ] Railway account (free)
- [ ] Vercel account (free)
- [ ] GitHub repository pushed

After deploying:

- [ ] Backend health check works
- [ ] Frontend loads
- [ ] Can sign up/sign in
- [ ] Can add expenses
- [ ] Data saves to MongoDB
- [ ] No CORS errors
- [ ] No console errors

---

## 🎯 Your URLs Summary

After deployment, you'll have:

**Backend URL:**
```
https://your-app-name.up.railway.app
```

**Frontend URL:**
```
https://your-app-name.vercel.app
```

**API Base URL (for frontend):**
```
https://your-app-name.up.railway.app/api
```

---

## 💡 Pro Tips

1. **Free Tier Limits:**
   - Railway: $5 free credit/month (usually enough for small apps)
   - Vercel: Unlimited for personal projects
   - MongoDB Atlas: 512MB free storage
   - Clerk: 10,000 monthly active users free

2. **Auto-Deployment:**
   - Both Railway and Vercel auto-deploy on git push
   - Just push to GitHub and they deploy automatically!

3. **Custom Domain (Optional Later):**
   - You can add custom domain later if you want
   - For now, free subdomains work perfectly

4. **Monitoring:**
   - Check Railway logs if backend has issues
   - Check Vercel logs if frontend has issues
   - Use browser console for frontend debugging

---

## 🚀 You're Done!

Your app is now live and accessible from anywhere! Share your Vercel URL with anyone.

**Next Steps:**
- Test all features
- Share with friends
- Monitor usage
- Add more features!

---

## 📞 Still Having Issues?

1. **Check Logs:**
   - Railway: Service → Logs tab
   - Vercel: Deployment → Functions → View Function Logs
   - Browser: F12 → Console tab

2. **Verify Environment Variables:**
   - Railway: Variables tab (all should be set)
   - Vercel: Settings → Environment Variables (all should be set)

3. **Test Endpoints:**
   - Backend health: `https://your-backend-url/api/health`
   - Use Postman or curl to test API

4. **Common Mistakes:**
   - Forgetting `/api` at end of `VITE_API_URL`
   - Wrong Clerk secret key (using publishable instead of secret)
   - MongoDB connection string with wrong password
   - Frontend URL in backend doesn't match Vercel URL

---

**Happy Deploying! 🎉**

