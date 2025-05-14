// src/pages/Login.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // You can access the signed‐in user via result.user
      console.log('Logged in as:', result.user);
      // Redirect to your calendar or home
      navigate('/calendar');
    } catch (err) {
      console.error('Google login error:', err);
      alert('Login failed. See console for details.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fef9f4]">
      <div className="w-full max-w-xs p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center text-[#004b6e]">
          Sign In
        </h2>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-5 h-5 mr-2"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
