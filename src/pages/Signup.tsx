// src/pages/Signup.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleUserRound } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const navigate = useNavigate();

  // Handle email/password signup
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Create user in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        circleId: null,
        createdAt: new Date(),
      });

      alert('Signup successful!');
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle Google signup
  const handleGoogleSignup = async () => {
    setLoadingGoogle(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const existing = await getDoc(userRef);

      // Only add to Firestore if not already existing
      if (!existing.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          circleId: null,
          createdAt: new Date(),
        });
      }

      navigate('/');
    } catch (err: any) {
      console.error('Google signup error:', err.message);
      setError('Google signup failed.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#fef9f4]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <CircleUserRound className="mx-auto h-16 w-16 text-[#004b6e]" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create Your Tribal Account</h2>
          <p className="mt-2 text-sm text-gray-600">Sign up with email or Google</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-lg w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] sm:text-sm"
            />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-lg w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] sm:text-sm"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#004b6e] hover:bg-[#003b56]"
          >
            Sign Up
          </button>
        </form>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#fef9f4] text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loadingGoogle}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          {loadingGoogle ? (
            <svg className="animate-spin h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5 mr-2"
            />
          )}
          {loadingGoogle ? 'Signing up...' : 'Continue with Google'}
        </button>

        <div className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-[#004b6e] font-medium hover:underline">
            Sign in here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
