"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

// Augment the User type to include our custom role claim
interface UserWithRole extends User {
  role?: 'admin' | 'guard' | 'resident';
}

interface AuthContextType {
  user: UserWithRole | null;
  loading: boolean;
  role: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, role: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        const userRole = (tokenResult.claims.roles as string[])?.[0] || null;
        setUser({ ...user, role: userRole as 'admin' | 'guard' | 'resident' });
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/';
    const isGuardPage = pathname.startsWith('/guard');
    const isAdminPage = pathname.startsWith('/admin');
    const isResidentPage = pathname.startsWith('/resident');

    if (!user) {
      // If not logged in and trying to access a protected page, redirect to login
      if (isGuardPage || isAdminPage || isResidentPage) {
        router.push('/');
      }
      return;
    }

    // If logged in, handle redirection based on role
    if (isAuthPage) {
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'guard') {
        router.push('/guard/dashboard');
      } else if (role === 'resident') {
        router.push('/resident/dashboard');
      }
    } else if (isAdminPage && role !== 'admin') {
      router.push(role === 'guard' ? '/guard/dashboard' : role === 'resident' ? '/resident/dashboard' : '/');
    } else if (isGuardPage && role !== 'guard') {
      router.push(role === 'admin' ? '/admin/dashboard' : role === 'resident' ? '/resident/dashboard' : '/');
    } else if (isResidentPage && role !== 'resident') {
        router.push(role === 'admin' ? '/admin/dashboard' : role === 'guard' ? '/guard/dashboard' : '/');
    }
  }, [user, role, loading, pathname, router]);


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // These checks prevent rendering the wrong layout during a redirect
  if ((pathname.startsWith('/guard') || pathname.startsWith('/admin') || pathname.startsWith('/resident')) && !user) {
    return null;
  }
  if (pathname === '/' && user) {
    return null;
  }


  return (
    <AuthContext.Provider value={{ user, loading, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper component for loading UI
import { Loader2 } from 'lucide-react';

const FullPageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);
