import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { cloud } from "./cloud";
export function useAuthUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    if (!cloud) { setUser(null); return; }
    let active = true;
    void cloud.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user);
    }).catch(() => { if (active) setUser(null); });
    const { data: sub } = cloud.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user || null);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);
  return { user, loading: user === undefined };
}
