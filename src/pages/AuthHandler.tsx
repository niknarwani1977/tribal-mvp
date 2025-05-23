// src/pages/AuthHandler.tsx
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthHandler() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  console.log(
    'AuthHandler: loading =', loading,
    ', currentUser =', currentUser,
    ', window.location.href =', window.location.href
  );
  if (!loading) {
    if (currentUser) {
      console.log('Redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    } else {
      console.log('Redirecting to login');
      navigate('/login', { replace: true });
    }
  }
}, [currentUser, loading, navigate]);

  return <div>Loading...</div>;
}
