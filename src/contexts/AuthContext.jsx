"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user profile from our custom table
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      // Fetch user profile
      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUserProfile(profile);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setUserProfile(null);
      }
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Role checking helpers
  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

  const isClinician = () => {
    return userProfile?.role === 'clinician';
  };

  const hasRole = (role) => {
    return userProfile?.role === role;
  };

  // Check if user can access a resource
  const canAccess = (allowedRoles = []) => {
    if (!userProfile) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(userProfile.role);
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    // State
    user,
    userProfile,
    loading,
    
    // Methods
    signIn,
    signOut,
    
    // Role helpers
    isAdmin,
    isClinician, 
    hasRole,
    canAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Higher-order component for protecting routes
export function withAuth(Component, allowedRoles = []) {
  return function AuthenticatedComponent(props) {
    const { user, userProfile, loading, canAccess } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      );
    }

    if (!user || !userProfile) {
      // Redirect to login would happen here
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p>Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    if (!canAccess(allowedRoles)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p>You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 mt-2">
              Required roles: {allowedRoles.join(', ')}
            </p>
            <p className="text-sm text-gray-500">
              Your role: {userProfile?.role}
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}