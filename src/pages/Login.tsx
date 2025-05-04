// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { CircleUserRound } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loadingGoogle, setLoadingGoogle] = useState<boolean>(false); // loading state for Google login
  const navigate = useNavigate();

  // Handles email/password login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.circleId) {
            navigate("/calendar"); // If part of a circle → go to calendar
          } else {
            navigate("/create-circle"); // If no circle yet → prompt to create
          }
        } else {
          console.error("User document not found");
          navigate("/create-circle");
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handles Google login via popup
  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      // If first-time user → save to Firestore
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          circleId: null,
          createdAt: new Date()
        });
      }

      navigate('/'); // Redirect to home/dashboard
    } catch (err: any) {
      console.error("Google login error:", err.message);
      alert("Google login failed.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#fef9f4]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <CircleUserRound className="mx-auto h-16 w-16 text-[#004b6e]" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign In to TribalConnect</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your email or sign in with Google</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#004b6e] hover:bg-[#003b56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004b6e]"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#fef9f4] text-gray-500">or</span>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
          className="w-full mt-2 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
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
          {loadingGoogle ? "Signing in..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
};

export default Login;
