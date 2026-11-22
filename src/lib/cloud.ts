import { createClient } from "@supabase/supabase-js";

// Chave ANON/PUBLISHABLE pode ficar no frontend. A SEGURANÇA DEPENDE de RLS.
// NUNCA usar service_role ou tokens de pagamento em variáveis VITE_*.
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const cloud = url && anonKey ? createClient(url, anonKey, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
}) : null;

export const cloudReady = Boolean(cloud);

export async function isAdmin(userId: string): Promise<boolean> {
  if (!cloud) return false;
  const { data, error } = await cloud.from("user_roles")
    .select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
