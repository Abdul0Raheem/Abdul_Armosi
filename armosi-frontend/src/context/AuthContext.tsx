'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import {
  completeGoogleRedirectSignIn,
  getUserRole,
  signInAdminWithEmail,
  signInWithEmail,
  signInWithGoogleAccount,
  signOutUser,
  signUpWithEmail,
  type UserProfile,
} from '@/lib/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  role: UserProfile['role'] | null;
  roleLoading: boolean;
  isAdmin: boolean;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserProfile['role'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    completeGoogleRedirectSignIn().catch(() => null);

    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      if (currentUser) {
        setRoleLoading(true);
      } else {
        setRole(null);
        setRoleLoading(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    if (!user) {
      return () => {
        active = false;
      };
    }

    getUserRole(user.uid)
      .then(currentRole => {
        if (active) setRole(currentRole);
      })
      .catch(() => {
        if (active) setRole(null);
      })
      .finally(() => {
        if (active) setRoleLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const signUp = async (name: string, email: string, password: string) => {
    await signUpWithEmail(name, email, password);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  };

  const signInAdmin = async (email: string, password: string) => {
    await signInAdminWithEmail(email, password);
    setRole('admin');
    setRoleLoading(false);
  };

  const signInWithGoogle = async () => {
    return signInWithGoogleAccount();
  };

  const logout = async () => {
    await signOutUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        roleLoading,
        isAdmin: role === 'admin',
        loading,
        signUp,
        signIn,
        signInAdmin,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
