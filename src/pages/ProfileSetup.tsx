// src/pages/ProfileSetup.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { User, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * ProfileSetup
 * ------------
 * Page for new users to complete their profile (name, phone).
 * - Redirects to /login if signed out.
 * - If a Firestore profile exists, sends to /circles.
 * - Otherwise shows a simple form to collect fullName and phone.
 * - On submit, updates Auth displayName and writes a users/{uid} doc.
 */
const ProfileSetup: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // 1️⃣ Listen for auth and check existing profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate('/login');
        return;
      }
      setUser(u);
      const snap = await getDoc(doc(db, 'users', u.uid));
      if (snap.exists()) {
        navigate('/circles');
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  // 2️⃣ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      await updateProfile(user, { displayName: fullName });
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email: user.email,
        phone,
        createdAt: serverTimestamp(),
      });
      navigate('/circles');
    } catch (e: any) {
      console.error('Profile setup error:', e);
      setError(e.message || 'Unable to complete profile.');
      setLoading(false);
    }
  };

  // 3️⃣ Loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full" />
      </div>
    );
  }

  // 4️⃣ Render form
  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Complete Your Profile</h2>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block mb-1 font-medium">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block mb-1 font-medium">Phone Number</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <button
          type="submit"
          disabled={!fullName || loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? <div className="animate-spin h-5 w-5 border-2 border-gray-200 border-t-white rounded-full mx-auto" />
            : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
