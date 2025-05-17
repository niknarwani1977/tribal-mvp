// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
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
import Navbar from './components/Navbar';
import CircleDetails from './pages/CircleDetails';
// Navigation items for bottom navbar
const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Circles', path: '/circles' },
  { label: 'Notifications', path: '/notifications' },
];

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#fef9f4]">
        <div className="max-w-md mx-auto pb-20">
          <Routes>
            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Main application */}
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
          </Routes>
        </div>
        {/* Bottom nav bar */}
        <Navbar items={navItems} />
      </div>
    </Router>
  );
};

export default App;
