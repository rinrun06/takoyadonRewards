import { useState, useEffect, createContext, useContext, type ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

// --- TYPE DEFINITIONS ---
interface Profile {
  id: string;
  email: string;
  role: string | null;
  display_name: string;
  created_at: string;
  total_points: number;
  phone_number: string | null;
  date_of_birth: string | null;
  google_user_data?: { name?: string };
  loyalty_points?: number;
  birthday_date?: string;
  total_visits?: number;
  influencer_status?: string;
  full_name?: string;
  avatar_url?: string;
  referral_code?: string;
  primary_branch_id?: number;
  primary_franchise_id?: number;
  branch_id?: number;
  points?: number;
}

interface RemoteConfig {
  [key: string]: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  remoteConfigValues: RemoteConfig | null;
  setRemoteConfigValues: (values: RemoteConfig) => void;
  logout: () => void;
  refreshProfile: () => void;
  setProfile: (profile: Profile | null) => void;
}

// --- AUTH CONTEXT ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- AUTH PROVIDER ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [remoteConfigValues, setRemoteConfigValues] = useState<RemoteConfig | null>(null);

  const fetchProfile = useCallback(async (user: User) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        return profileData;
      }

      if (profileError && profileError.code === 'PGRST116') {
        const newUserProfile = {
          id: user.id,
          email: user.email!,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          role: 'customer',
        };

        const { data: createdProfile, error: insertError } = await supabase
          .from('users')
          .insert(newUserProfile)
          .select()
          .single();
        
        if (insertError) {
          console.error("Error creating profile:", insertError);
          setProfile(null);
        } else {
          setProfile(createdProfile);
          return createdProfile;
        }
      } else if (profileError) {
        console.error("Error fetching profile:", profileError);
        setProfile(null);
      }
    } catch (e) {
        console.error("Exception in fetchProfile:", e);
        setProfile(null);
    }
    return null;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (isMounted && initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(initialSession.user);
        }
      } catch (e) {
        console.error("Error initializing session:", e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (isMounted) {
        setSession(newSession);
        const newAuthUser = newSession?.user ?? null;
        setUser(newAuthUser);
        if (newAuthUser) {
          await fetchProfile(newAuthUser);
        } else {
          setProfile(null);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  const value = useMemo(() => ({
    session,
    user,
    profile,
    loading,
    remoteConfigValues,
    setRemoteConfigValues,
    logout,
    refreshProfile,
    setProfile,
  }), [session, user, profile, loading, remoteConfigValues, logout, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- CUSTOM HOOK ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
