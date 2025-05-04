
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Users, Calendar, Bell, PlusCircle, Home } from 'lucide-react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TrustedCircles from './pages/TrustedCircles';
import CalendarView from './pages/CalendarView';
import CreateEvent from './pages/CreateEvent';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Signup from './pages/Signup'; // at top
import CalendarView from "./pages/CalendarView";
import Invite from "./pages/Invite";
import EditEvent from './pages/EditEvent';
import ManageFamily from './pages/ManageFamily';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/circles', icon: Users, label: 'Trusted Circles' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/create-event', icon: PlusCircle, label: 'Create Event' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/manage-family', icon: Users, label: 'Family' }, // ✅ New link
];

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#fef9f4]">
        <div className="max-w-md mx-auto pb-20">
          <Routes>
            <Route path="/login" element={<Login />} />
	    <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/circles" element={<TrustedCircles />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/notifications" element={<Notifications />} />
	    <Route path="/create-circle" element={<CreateCircle />} />
	    <Route path="/invite" element={<Invite />} />
	    <Route path="/edit-event/:id" element={<EditEvent />} />
	    <Route path="/manage-family" element={<ManageFamily />} />
          </Routes>
        </div>
        <Navbar items={navItems} />
      </div>
    </Router>
  );
}

export default App;
