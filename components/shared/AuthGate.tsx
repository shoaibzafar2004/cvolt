import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface AuthGateProps {
  children: React.ReactNode;
  returnTo?: string;
}

export default async function AuthGate({ children, returnTo }: AuthGateProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const params = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
    redirect(`/login${params}`);
  }

  return <>{children}</>;
}
