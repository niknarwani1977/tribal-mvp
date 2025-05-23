import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup, // <-- Add this here!
  User
} from 'firebase/auth';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../utils/firebase';


interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Email signup
  function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password).then(
      (userCredential) => userCredential.user
    );
  }

  // 🔐 Email login
  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password).then(
      (userCredential) => userCredential.user
    );
  }

  // 🔓 Logout
  function logout() {
    return signOut(auth);
  }

  // 🔁 Google login (redirect-based)
async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Google login error:', error);
    throw error; // Pass error to caller for UI handling
  }
}

  // 🔁 Password reset
  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  // 🧑‍💼 Profile update
  function updateUserProfile(displayName: string, photoURL: string) {
    if (!auth.currentUser) {
      return Promise.reject(new Error('No user is currently signed in'));
    }
    return updateProfile(auth.currentUser, { displayName, photoURL });
  }

  // 👁 Auth state only (no redirect result here)
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged fired. User:', user);
    setCurrentUser(user);
    setLoading(false);
  });
  return unsubscribe;
}, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
