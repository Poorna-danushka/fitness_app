# 🚀 GymFit Pro - Quick Start Guide

## ⚡ 5-Minute Setup

Follow these steps to get the entire app running locally.

## Prerequisites
- **Node.js** v14+ ([Download here](https://nodejs.org/))
- **MongoDB** - Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud DB)
- **Postman** (optional, for API testing)

---

## Step 1: Setup MongoDB

### Option A: Using MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free tier)
4. Get your connection string
5. Update it in backend `.env` file

### Option B: Local MongoDB
```bash
# Windows
# Download from https://www.mongodb.com/try/download/community
# Follow installation wizard

# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

Test connection:
```bash
mongosh
# or
mongo
```

---

## Step 2: Backend Setup

### 2.1 Navigate to backend folder
```bash
cd backend
```

### 2.2 Install dependencies
```bash
npm install
```

### 2.3 Create .env file
```bash
# Copy the example file
cp .env.example .env

# Edit .env and update MongoDB URI
# Windows: notepad .env
# macOS/Linux: nano .env
```

**Example .env:**
```
MONGODB_URI=mongodb://localhost:27017/gymfit-pro
JWT_SECRET=your_super_secret_key_12345
JWT_REFRESH_SECRET=your_super_secret_refresh_key_12345
PORT=5000
NODE_ENV=development
```

### 2.4 Seed the database with exercises
```bash
npm run seed
```

✅ You should see: `✅ Successfully seeded 6 exercises!`

### 2.5 Start the backend server
```bash
npm run dev
```

✅ You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

---

## Step 3: Frontend Setup

### 3.1 Open a NEW terminal and navigate to frontend
```bash
cd frontend
```

### 3.2 Install dependencies
```bash
npm install
```

### 3.3 Start the frontend development server
```bash
npm run dev
```

✅ You should see:
```
VITE v5.0.0  ready in XXX ms

➜  Local:   http://localhost:3000/
```

---

## Step 4: Access the Application

1. Open your browser and go to: **http://localhost:3000**
2. You should see the GymFit Pro login page

---

## Step 5: Test the App

### Create an Account
1. Click **"Register"**
2. Fill in:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
3. Click **Register**

### Explore Features
- **Dashboard** - View your stats
- **Exercises** - Browse all exercises
- **Workouts** - Log new workouts
- **Profile** - Update personal info

---

## 📝 Testing with Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import `POSTMAN_COLLECTION.json` from the root folder
3. Update `YOUR_TOKEN_HERE` with your JWT token from login response
4. Test API endpoints!

---

## 🔑 Default Test Credentials

After running `npm run seed`, you can register any account. Here's an example:

```
Email: test@example.com
Password: test123456
```

---

## 🆘 Troubleshooting

### Issue: "MongoDB connection error"
**Solution:**
- Make sure MongoDB is running
- Check your MONGODB_URI in .env
- Try connection string: `mongodb://localhost:27017/gymfit-pro`

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
# Make sure you're in the backend folder
cd backend
npm install
```

### Issue: "Frontend won't connect to backend"
**Solution:**
- Make sure backend is running on port 5000
- Check vite.config.ts proxy settings
- Clear browser cache and restart frontend

### Issue: "npm: command not found"
**Solution:**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal

---

## 📊 Project Structure Overview

```
fitness_app/
├── backend/              ← Node.js + MongoDB API
│   ├── models/          ← Database schemas
│   ├── controllers/      ← Business logic
│   ├── routes/          ← API endpoints
│   ├── middleware/      ← Authentication
│   ├── seed/            ← Database seeding
│   └── server.js        ← Main server file
│
├── frontend/            ← React + Vite UI
│   ├── src/
│   │   ├── pages/      ← 6 main pages
│   │   ├── api/        ← API service
│   │   └── App.tsx     ← Main component
│   └── index.html      ← Entry point
│
└── README.md           ← Full documentation
```

---

## 🎯 What's Included

✅ **6 Pre-loaded Exercises**
- Push Ups, Squats, Bench Press
- Deadlift, Pull Ups, Plank

✅ **Complete Authentication**
- Register, Login, Logout
- JWT token-based security
- Protected routes

✅ **Workout Tracking**
- Log workouts with auto calorie calculation
- View history with filters
- Edit and delete workouts

✅ **User Dashboard**
- Welcome message
- Total workouts and calories
- Weekly progress tracking
- Stats dashboard

✅ **Professional UI**
- Responsive design (mobile-friendly)
- Tailwind CSS styling
- Smooth navigation

---

## 🚀 Next Steps

### Add More Features
- [ ] User roles (Admin/User)
- [ ] Workout plans
- [ ] Progress graphs
- [ ] Email notifications
- [ ] Mobile app

### Deploy to Production
- Backend: Heroku, Railway, or AWS
- Frontend: Vercel or Netlify
- Database: MongoDB Atlas (free tier available)

### Learn More
- MongoDB: [mongodb.com/docs](https://docs.mongodb.com/)
- Express: [expressjs.com](https://expressjs.com/)
- React: [react.dev](https://react.dev/)
- Tailwind: [tailwindcss.com](https://tailwindcss.com/)

---

## 📞 Support

If you encounter issues:
1. Check the [README.md](README.md) for detailed docs
2. Look at the [Troubleshooting](#troubleshooting) section
3. Check terminal error messages
4. Try restarting both servers

---

## 🎓 Learning Paths

**For Beginners:**
1. Understand the file structure
2. Run and explore the app
3. Look at database models
4. Check API endpoints in Postman

**For Intermediate:**
1. Modify the UI components
2. Add new exercises via API
3. Change styling with Tailwind
4. Add new database fields

**For Advanced:**
1. Add user roles and permissions
2. Create workout plans
3. Add real-time features with Socket.io
4. Deploy to production

---

## ✅ Checklist

- [ ] Node.js installed and working
- [ ] MongoDB running locally or on Atlas
- [ ] Backend dependencies installed (`npm install`)
- [ ] .env file created with MongoDB URI
- [ ] Database seeded (`npm run seed`)
- [ ] Backend running on port 5000
- [ ] Frontend dependencies installed
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can register and login

---

**You're all set! 🎉 Start tracking your workouts now!**
