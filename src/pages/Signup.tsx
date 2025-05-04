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
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // Email/password signup handler
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Create user record in Firestore
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

  // Google signup handler
  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const existing = await getDoc(userRef);

      // If not found, create a new user document
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
      setError(err.message);
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
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
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
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
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
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#004b6e] hover:bg-[#003b56]"
          >
            Sign Up
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">or</div>

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm font-medium hover:bg-gray-50"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="h-5 w-5 mr-2"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Signup;
