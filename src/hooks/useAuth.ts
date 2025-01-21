import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { UserRole } from '../lib/types/supabase';

interface AuthUser extends User {
  role: UserRole;
}

async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return 'customer'; // Default role if error
  }

  return data.role;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setUser({ ...session.user, role });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setUser({ ...session.user, role });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading, signOut };
} 