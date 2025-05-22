// src/pages/Login.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Logged in as:', result.user);
      navigate('/calendar');
    } catch (err: any) {
      console.error('Google login error:', err);
      
      if (err.code === 'auth/popup-blocked') {
        setError(
          'The login popup was blocked by your browser. Please enable popups for this site and try again. You may need to:\n\n' +
          '1. Check your browser\'s popup settings\n' +
          '2. Disable any ad blockers for this site\n' +
          '3. Look for a popup notification at the top of your browser'
        );
      } else {
        setError('An error occurred during login. Please try again.');
      }
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