// src/pages/Login.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for redirect result when component mounts
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('Logged in as:', result.user);
          navigate('/calendar');
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        setError('An error occurred during login. Please try again.');
      });
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await signInWithRedirect(auth, googleProvider);
      // The page will redirect to Google and then come back
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fef9f4]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center text-[#004b6e]">
          Sign In
        </h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
              <p className="text-red-700 whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
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