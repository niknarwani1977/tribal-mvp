// src/pages/ProfileSetup.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { User, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';

/**
 * ProfileSetup
 * ------------
 * Page for new users to complete their profile (name, phone).
 * - Checks if the user is authenticated.
 * - If profile already exists, redirects to /circles.
 * - Otherwise shows form to collect fullName and phone.
 * - On submit, updates Firebase Auth displayName and saves to Firestore users collection.
 */
const ProfileSetup: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // Listen for auth state and check existing profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        // Not signed in → redirect to login
        navigate('/login');
        return;
      }
      setUser(u);
      // Check if profile document exists
      const profileSnap = await getDoc(doc(db, 'users', u.uid));
      if (profileSnap.exists()) {
        // Profile already set up → go to circles
        navigate('/circles');
      } else {
        // Show form
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      // 1️⃣ Update Firebase Auth displayName
      await updateProfile(user, { displayName: fullName });
      // 2️⃣ Create Firestore user profile document
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email: user.email,
        phone,
        createdAt: serverTimestamp(),
      });
      // 3️⃣ Redirect to circles after setup
      navigate('/circles');
    } catch (err: any) {
      console.error('Profile setup error:', err);
      setError(err.message || 'Failed to complete profile.');
      setLoading(false);
    }
  };

  // Show spinner while loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={!fullName || loading}>
          {loading ? <Spinner size="sm" /> : 'Save Profile'}
        </Button>
      </form>
    </div>
  );
};

export default ProfileSetup;
