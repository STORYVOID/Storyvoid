
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

interface UseAuthProps {
  fetchUserWallet: (userId: string) => Promise<void>;
  resetWallet: () => void;
  showMessage: (title: string, message: string) => void;
}

export const useAuth = ({
  fetchUserWallet,
  resetWallet,
  showMessage,
}: UseAuthProps) => {
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const authUserIdRef = useRef<string | null>(null);

  const applyAuthUser = useCallback(
    async (user: any) => {
      if (!user) {
        authUserIdRef.current = null;
        setIsLoggedIn(false);
        setUserEmail('');
        setIsAdmin(false);
        resetWallet();
        return;
      }

      authUserIdRef.current = user.id;
      setUserEmail((user.email || '').toLowerCase());
      setIsLoggedIn(true);
      setIsAdmin(user.app_metadata?.role === 'admin');

      resetWallet();
      await fetchUserWallet(user.id);
    },
    [fetchUserWallet, resetWallet]
  );

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          await applyAuthUser(data.session?.user || null);
        }
      } catch (error) {
        console.error('Session restore error:', error);
        if (mounted) await applyAuthUser(null);
      } finally {
        if (mounted) setAuthReady(true);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          void applyAuthUser(session?.user || null);
          setAuthReady(true);
        }
      }
    );

    void restoreSession();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [applyAuthUser]);

  const handleLogin = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (!data.session?.user) {
        showMessage('Login Required', 'Please login again.');
        return;
      }

      await applyAuthUser(data.session.user);

      showMessage(
        'Welcome!',
        data.session.user.app_metadata?.role === 'admin'
          ? 'Admin login successful.'
          : 'Login successful.'
      );
    } catch (error: any) {
      console.error('Login error:', error);
      showMessage('Login Failed', error.message || 'Please try again.');
    }
  }, [applyAuthUser, showMessage]);

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      await applyAuthUser(null);
      showMessage('Logged Out', 'You have been logged out.');
    } catch (error: any) {
      console.error('Logout error:', error);
      showMessage('Logout Failed', error.message || 'Please try again.');
    }
  }, [applyAuthUser, showMessage]);

  return {
    authReady,
    isLoggedIn,
    userEmail,
    isAdmin,
    authUserIdRef,
    applyAuthUser,
    handleLogin,
    handleLogout,
  };
};
