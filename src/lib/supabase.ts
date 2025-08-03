import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to get current user's organization
export const getCurrentOrganization = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id, organizations(*)')
    .eq('id', user.id)
    .single();

  return profile?.organizations || null;
};

// Helper function to set organization context for RLS
export const setOrganizationContext = async (organizationId: string) => {
  await supabase.rpc('set_current_tenant', { tenant_id: organizationId });
};