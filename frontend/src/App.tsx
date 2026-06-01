import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PackageList from './pages/PackageList';
import MyPackage from './pages/MyPackage';
import ExerciseView from './pages/ExerciseView';
import Profile from './pages/Profile';
import Workouts from './pages/Workouts';
import UserNotificationsPage from './pages/UserNotificationsPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManagePackages from './pages/admin/ManagePackages';
import ManageExercises from './pages/admin/ManageExercises';
import ManageUsers from './pages/admin/ManageUsers';
import ManagePurchases from './pages/admin/ManagePurchases';
import ManageNotifications from './pages/admin/ManageNotifications';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';
import Notifications from './components/Notifications';

// Smart root: redirect to the right place if already logged in
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Home />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

function LoginRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  return <Login />;
}

function RegisterRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  return <Register />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Notifications />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginRedirect />} />
          <Route path="/register" element={<RegisterRedirect />} />

          {/* User-only Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/dashboard"          element={<Dashboard />} />
              <Route path="/packages"           element={<PackageList />} />
              <Route path="/my-package"         element={<MyPackage />} />
              <Route path="/workouts"           element={<Workouts />} />
              <Route path="/exercises/:id"      element={<ExerciseView />} />
              <Route path="/profile"            element={<Profile />} />
              <Route path="/notifications"      element={<UserNotificationsPage />} />
            </Route>
          </Route>

          {/* Admin-only Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route element={<AdminLayout />}>
              <Route path="dashboard"      element={<AdminDashboard />} />
              <Route path="packages"       element={<ManagePackages />} />
              <Route path="exercises"      element={<ManageExercises />} />
              <Route path="users"          element={<ManageUsers />} />
              <Route path="purchases"      element={<ManagePurchases />} />
              <Route path="notifications"  element={<ManageNotifications />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
