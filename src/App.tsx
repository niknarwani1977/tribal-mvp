// src/App.tsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import HomePage from './pages/HomePage';
import TrustedCircles from './pages/TrustedCircles';
import CalendarView from './pages/CalendarView';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Notifications from './pages/Notifications';
import CreateCircle from './pages/CreateCircle';
import JoinCircle from './pages/JoinCircle';
import ManageFamily from './pages/ManageFamily';
import AddFamilyMember from './pages/AddFamilyMember';
import Invite from './pages/Invite';
import CircleDetails from './pages/CircleDetails';

// Component
import Navbar from './components/Navbar';

// Navigation items for bottom navbar
const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Circles', path: '/circles' },
  { label: 'Notifications', path: '/notifications' },
];

/**
 * App
 * ---
 * Handles global routing and authentication-based redirection:
 * - Redirects unauthenticated users to /login
 * - New users without profile to /profile-setup
 * - Returning users to /circles
 * Renders all public and protected routes.
 */
const App: React.FC = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not signed in → login
        navigate('/login', { replace: true });
        setCheckingAuth(false);
        return;
      }
      try {
        // Check if user profile exists
        const profileSnap = await getDoc(doc(db, 'users', user.uid));
        if (profileSnap.exists()) {
          // Profile present → go to circles
          navigate('/circles', { replace: true });
        } else {
          // No profile → setup
          navigate('/profile-setup', { replace: true });
        }
      } catch (err) {
        console.error('Error checking profile:', err);
        // Default fallback
        navigate('/circles', { replace: true });
      } finally {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Show loading state while redirecting
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fef9f4]">
      <div className="max-w-md mx-auto pb-20">
        <Routes>
          {/* Authentication & Onboarding */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />

          {/* Main application routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Circle management */}
          <Route path="/circles" element={<TrustedCircles />} />
          <Route path="/create-circle" element={<CreateCircle />} />
          <Route path="/join-circle" element={<JoinCircle />} />
          <Route path="/circles/:circleId" element={<CircleDetails />} />

          {/* Family & invites */}
          <Route path="/manage-family" element={<ManageFamily />} />
          <Route path="/add-family-member" element={<AddFamilyMember />} />
          <Route path="/invite" element={<Invite />} />

          {/* Fallback: redirect unknown to circles */}
          <Route path="*" element={<Navigate to="/circles" replace />} />
        </Routes>
      </div>
      {/* Bottom navigation bar */}
      <Navbar items={navItems} />
    </div>
  );
};

/**
 * WrappedApp
 * ----------
 * We wrap App in Router so useNavigate works inside App component.
 */
const WrappedApp: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;
