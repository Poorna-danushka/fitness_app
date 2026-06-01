# 🏋️ GymFit Pro Backend - API Server

Complete Node.js + Express + MongoDB REST API for gym management and workout tracking.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Seed database with exercises
npm run seed

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

## 📦 Dependencies

```json
{
  "express": "^4.18.2",           // Web framework
  "mongoose": "^7.5.0",           // MongoDB ODM
  "bcryptjs": "^2.4.3",           // Password hashing
  "jsonwebtoken": "^9.1.0",       // JWT auth
  "dotenv": "^16.3.1",            // Environment variables
  "cors": "^2.8.5",               // Cross-origin requests
  "express-validator": "^7.0.0"   // Input validation
}
```

## 📂 Project Structure

```
backend/
├── models/
│   ├── User.js           # User schema with password hashing
│   ├── Exercise.js       # Exercise library schema
│   └── Workout.js        # Workout logging schema
│
├── controllers/
│   ├── authController.js      # Register, login, profile
│   ├── exerciseController.js  # Exercise CRUD operations
│   └── workoutController.js   # Workout CRUD + stats
│
├── routes/
│   ├── authRoutes.js          # Auth endpoints
│   ├── exerciseRoutes.js      # Exercise endpoints
│   └── workoutRoutes.js       # Workout endpoints
│
├── middleware/
│   └── auth.js                # JWT verification
│
├── seed/
│   └── seedExercises.js       # Database initialization
│
├── server.js              # Main app file
├── package.json          # Dependencies
└── .env.example          # Environment template
```

## ⚙️ Environment Variables

Create a `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/gymfit-pro

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Server
PORT=5000
NODE_ENV=development
```

## 🔗 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Create new user |
| POST | `/login` | No | Login user |
| GET | `/me` | Yes | Get current user |
| PUT | `/profile` | Yes | Update user info |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "weight": null,
    "height": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 💪 Exercises (`/api/exercises`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Get all exercises |
| GET | `/:id` | No | Get exercise by ID |
| POST | `/` | Yes | Create new exercise |
| PUT | `/:id` | Yes | Update exercise |
| DELETE | `/:id` | Yes | Delete exercise |

**Get All Exercises Response:**
```json
{
  "message": "Exercises fetched successfully",
  "count": 6,
  "exercises": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Push Ups",
      "muscleGroup": "Chest, Triceps",
      "equipment": "None",
      "difficulty": "Beginner",
      "caloriesPer10Min": 80,
      "description": "Bodyweight upper body push exercise",
      "createdAt": "2024-05-30T10:00:00Z"
    },
    ...
  ]
}
```

---

### 📋 Workouts (`/api/workouts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get all user workouts |
| GET | `/:id` | Yes | Get workout by ID |
| POST | `/` | Yes | Create new workout |
| PUT | `/:id` | Yes | Update workout |
| DELETE | `/:id` | Yes | Delete workout |
| GET | `/stats` | Yes | Get user statistics |

**Create Workout Request:**
```json
{
  "exerciseId": "507f1f77bcf86cd799439011",
  "duration": 30,
  "sets": 3,
  "reps": 10,
  "date": "2024-05-30"
}
```

**Workout Response:**
```json
{
  "message": "Workout created successfully",
  "workout": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "exerciseId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Push Ups",
      "caloriesPer10Min": 80
    },
    "duration": 30,
    "sets": 3,
    "reps": 10,
    "caloriesBurned": 240,
    "date": "2024-05-30",
    "createdAt": "2024-05-30T10:00:00Z"
  }
}
```

**Stats Response:**
```json
{
  "message": "Statistics fetched successfully",
  "stats": {
    "totalWorkouts": 5,
    "totalCalories": 1200,
    "weeklyWorkouts": 3,
    "weeklyCalories": 600
  }
}
```

---

## 🗄️ Database Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed with bcrypt),
  weight: Number (optional, in kg),
  height: Number (optional, in cm),
  createdAt: Date,
  updatedAt: Date
}
```

### Exercise Model
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  muscleGroup: String (required),
  equipment: String (required),
  difficulty: String (Beginner|Intermediate|Advanced),
  caloriesPer10Min: Number (required),
  description: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Workout Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  exerciseId: ObjectId (ref: Exercise, required),
  duration: Number (required, in minutes),
  sets: Number (optional),
  reps: Number (optional),
  caloriesBurned: Number (calculated automatically),
  date: Date (required),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Security Features

### Password Hashing
- Uses `bcryptjs` to hash passwords
- Passwords are never stored in plain text
- 10 salt rounds for security

### JWT Authentication
- Access tokens expire in 7 days
- Token included in Authorization header: `Bearer <token>`
- Middleware validates token on protected routes

### Protected Routes
- All user-specific routes require authentication
- Authorization checks ensure users can only access their own data
- Workout CRUD operations verify user ownership

---

## 🎯 Pre-seeded Exercises

Run `npm run seed` to add these exercises:

| # | Name | Muscle | Equipment | Difficulty | Cal/10min |
|---|------|--------|-----------|------------|-----------|
| 1 | Push Ups | Chest, Triceps | None | Beginner | 80 |
| 2 | Squats | Legs, Glutes | None | Beginner | 100 |
| 3 | Bench Press | Chest | Barbell | Intermediate | 120 |
| 4 | Deadlift | Back, Legs | Barbell | Advanced | 150 |
| 5 | Pull Ups | Back, Biceps | Pull-up bar | Intermediate | 110 |
| 6 | Plank | Core | None | Beginner | 50 |

---

## 📊 Calorie Calculation

Formula:
```
Calories = (Exercise Calories Per 10 Min) × (Duration / 10)
```

Examples:
- Push Ups for 30 min: `80 × (30/10) = 240 calories`
- Deadlift for 20 min: `150 × (20/10) = 300 calories`
- Plank for 10 min: `50 × (10/10) = 50 calories`

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Exercises
```bash
curl http://localhost:5000/api/exercises
```

### Create Workout (Requires Token)
```bash
curl -X POST http://localhost:5000/api/workouts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "exerciseId": "EXERCISE_ID",
    "duration": 30,
    "date": "2024-05-30"
  }'
```

---

## 🚀 Running the Server

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

---

## 🆘 Troubleshooting

### "MongoDB connection error"
```bash
# Check MongoDB is running
mongosh

# Verify URI in .env
MONGODB_URI=mongodb://localhost:27017/gymfit-pro
```

### "JWT verification failed"
```bash
# Make sure token is passed correctly
Authorization: Bearer <your_token_here>

# Check JWT_SECRET matches in .env
```

### "Port 5000 already in use"
```bash
# Kill process on port 5000
# Windows: netstat -ano | findstr :5000
# Linux/Mac: lsof -i :5000
```

---

## 📝 API Response Format

All responses follow this format:

**Success (2xx):**
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

**Error (4xx/5xx):**
```json
{
  "message": "Error description",
  "error": "error details"
}
```

---

## 🔄 Request/Response Flow

```
Client (Frontend)
    ↓
   POST /api/auth/login
    ↓
Backend (Express)
    ↓
  Database (MongoDB)
    ↓
   Generate JWT
    ↓
  Return Token
    ↓
Client stores token in localStorage
    ↓
Include token in Authorization header
    ↓
Middleware verifies token
    ↓
Access protected routes
```

---

## 🌐 CORS Configuration

Enabled for all origins in development. Configure in `server.js`:

```javascript
app.use(cors());  // All origins allowed

// Or restrict:
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

---

## 📚 Additional Resources

- **Express Docs**: [expressjs.com](https://expressjs.com/)
- **Mongoose Docs**: [mongoosejs.com](https://mongoosejs.com/)
- **JWT Guide**: [jwt.io](https://jwt.io/)
- **MongoDB**: [mongodb.com/docs](https://docs.mongodb.com/)

---

**Happy coding! 🚀**
