# 🎨 GymFit Pro Frontend - React + Vite UI

Professional React frontend for gym management and workout tracking with Tailwind CSS styling.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

## 📦 Dependencies

```json
{
  "react": "^18.2.0",              // UI library
  "react-dom": "^18.2.0",          // React DOM rendering
  "react-router-dom": "^6.20.0",   // Client-side routing
  "axios": "^1.6.0",               // HTTP client
  "tailwindcss": "^3.3.0",         // CSS framework
  "typescript": "^5.2.2"           // Type safety
}
```

## 📂 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.tsx           # User login page
│   │   ├── Register.tsx        # Account creation
│   │   ├── Dashboard.tsx       # Home with stats
│   │   ├── Exercises.tsx       # Exercise library
│   │   ├── Workouts.tsx        # Workout tracking
│   │   └── Profile.tsx         # User profile & settings
│   │
│   ├── api/
│   │   └── apiService.ts       # Axios API client
│   │
│   ├── App.tsx                 # Main router
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── index.html                  # HTML template
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind config
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
```

## 🎨 Pages

### 1. Login (`/login`)
- Email and password input
- Error messages
- Link to register page
- Stores JWT token on success

### 2. Register (`/register`)
- Name, email, password input
- Form validation
- Link to login page
- Auto-login after registration

### 3. Dashboard (`/dashboard`)
- Welcome message with user name
- 4 stats cards:
  - Total Workouts
  - Total Calories Burned
  - Weekly Workouts
  - Weekly Calories
- Navigation to other pages
- Logout button

### 4. Exercises (`/exercises`)
- Display all gym exercises
- Search/filter by name or muscle group
- Exercise cards showing:
  - Name, muscle group, equipment
  - Difficulty level
  - Calories per 10 minutes
  - Description
- Responsive grid layout

### 5. Workouts (`/workouts`)
- Form to add new workouts
- Select exercise from dropdown
- Enter duration, sets, reps, date
- Table showing workout history
- Edit and delete functionality
- Auto-calculates calories
- Sort by date (newest first)

### 6. Profile (`/profile`)
- Display user information
- Email address
- Full name
- Weight and height
- BMI calculation
- Member since date
- Edit profile button
- Update name, weight, height

---

## 🔑 Key Features

### Authentication
- JWT token stored in localStorage
- Auto-login on page refresh
- Redirect to login if not authenticated
- Logout clears token

### API Integration
- Axios interceptor adds token to requests
- Error handling for failed requests
- Loading states
- Response handling

### Form Handling
- React state management
- Form validation
- Error messages
- Success feedback

### Routing
- React Router v6
- Protected routes
- Auto-redirect logic
- Smooth navigation

### Styling
- Tailwind CSS utilities
- Responsive design (mobile-first)
- Color scheme: Blue/Green/Red
- Professional UI components

---

## 📝 API Service (`src/api/apiService.ts`)

All API calls go through this centralized service:

```typescript
// Auth
authAPI.register(name, email, password)
authAPI.login(email, password)
authAPI.getMe()
authAPI.updateProfile(data)

// Exercises
exerciseAPI.getAll()
exerciseAPI.getById(id)
exerciseAPI.create(data)
exerciseAPI.update(id, data)
exerciseAPI.delete(id)

// Workouts
workoutAPI.getAll()
workoutAPI.getById(id)
workoutAPI.create(data)
workoutAPI.update(id, data)
workoutAPI.delete(id)
workoutAPI.getStats()
```

---

## 🔐 Authentication Flow

```
1. User registers → API creates user + returns token
2. Token stored in localStorage
3. Token added to all API requests via interceptor
4. Protected routes check token existence
5. On logout → Token removed from localStorage
```

---

## 🎨 Tailwind CSS Classes Used

### Colors
- `bg-blue-600` - Primary blue
- `bg-green-600` - Success green
- `bg-red-600` - Danger red
- `bg-gray-100` - Light gray background

### Layout
- `flex`, `grid` - Flexbox and CSS Grid
- `container` - Centered container
- `gap-4`, `p-6` - Spacing
- `max-w-md` - Max width constraints

### Typography
- `text-4xl`, `font-bold` - Headings
- `text-gray-600` - Subtle text
- `text-center` - Text alignment

### Responsive
- `md:grid-cols-2` - Tablet breakpoint
- `lg:grid-cols-3` - Desktop breakpoint
- `w-full` - Full width

---

## 🚀 Environment Variables

Create `.env.local` (optional):

```env
VITE_API_BASE_URL=/api
```

API calls default to `/api` via Vite proxy in `vite.config.ts`.

---

## 🧪 Component Patterns

### Page Component Structure
```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageName() {
  const [state, setState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
    // Fetch data
  }, []);

  return (
    // JSX here
  );
}
```

### API Call Pattern
```typescript
try {
  const response = await apiFunction();
  setState(response.data.data);
} catch (error) {
  setError(error.response?.data?.message || 'Error');
} finally {
  setLoading(false);
}
```

---

## 📱 Responsive Design

### Mobile (< 768px)
- Single column layout
- Full-width inputs
- Stacked navigation

### Tablet (768px - 1024px)
- 2 column grid for cards
- Readable font sizes
- Touch-friendly buttons

### Desktop (> 1024px)
- 3-4 column grids
- Optimal spacing
- Horizontal navigation

---

## 🎯 Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

Creates optimized `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

---

## 🔄 Data Flow

```
User Input (Form)
    ↓
State Update
    ↓
API Call (apiService)
    ↓
Server Response
    ↓
Update State/UI
    ↓
Display Results
```

---

## 📊 Example: Workout Creation Flow

1. User clicks "Add Workout"
2. Form appears with fields
3. User fills form and submits
4. Form validation checks
5. API call: `POST /api/workouts`
6. Calories auto-calculated
7. Workout added to table
8. Form clears, table refreshes
9. Success feedback shown

---

## 🆘 Common Issues

### Issue: "Cannot find localStorage"
**Solution:** Only access localStorage in useEffect or event handlers

### Issue: "Token not being sent"
**Solution:** Check `apiService.ts` interceptor is properly configured

### Issue: "Styling not applying"
**Solution:** Make sure Tailwind classes are used exactly (no custom values)

### Issue: "Page blank after login"
**Solution:** Check browser console for errors, verify API is running

---

## 💻 Development Tips

### Hot Module Replacement (HMR)
- Vite auto-reloads on file save
- State is preserved during reload
- No full page refresh needed

### Browser DevTools
- React DevTools extension for component inspection
- Network tab to check API calls
- Storage tab to view localStorage

### Debugging
```typescript
// Add console logs
console.log('value:', value);

// Debug in useEffect
useEffect(() => {
  console.log('Component mounted');
  return () => console.log('Component unmounted');
}, []);
```

---

## 🌐 CORS & Proxy

Vite proxy redirects `/api/*` to backend in `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
}
```

This allows frontend on port 3000 to call backend on port 5000.

---

## 📚 TypeScript Types

Common types used:

```typescript
// User
interface User {
  id: string;
  name: string;
  email: string;
  weight?: number;
  height?: number;
}

// Exercise
interface Exercise {
  _id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  caloriesPer10Min: number;
  description: string;
}

// Workout
interface Workout {
  _id: string;
  exerciseId: Exercise;
  duration: number;
  sets?: number;
  reps?: number;
  caloriesBurned: number;
  date: string;
}
```

---

## 🚀 Performance Tips

1. **Lazy Loading**
   - Routes load only when needed
   - Images could use lazy loading

2. **Caching**
   - Store user data in state
   - Reduce API calls

3. **Rendering**
   - Use keys in lists
   - Avoid inline functions in render

4. **Bundle Size**
   - Vite creates optimized bundles
   - Tree-shaking removes unused code

---

## 📚 Additional Resources

- **React**: [react.dev](https://react.dev/)
- **Vite**: [vitejs.dev](https://vitejs.dev/)
- **React Router**: [reactrouter.com](https://reactrouter.com/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)
- **Axios**: [axios-http.com](https://axios-http.com/)

---

## 🎓 Learning Paths

**For Beginners:**
- Understand React hooks (useState, useEffect)
- Learn React Router basics
- Explore Tailwind CSS utilities

**For Intermediate:**
- Add form validation
- Implement loading states
- Add error boundaries

**For Advanced:**
- State management (Context/Redux)
- Custom hooks
- Code splitting

---

**Happy coding! 🎨**
