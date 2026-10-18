import { createClient } from "@/lib/supabase/server";
import TemplateGallery from "./TemplateGallery";
import type { Template, Payment } from "@/types";

export default async function TemplatesPage() {
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("is_active", true)
    .order("created_at");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let payments: Payment[] = [];
  if (user) {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed");
    payments = (data ?? []) as Payment[];
  }

  const mapped: Template[] = (templates ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    thumbnailUrl: t.thumbnail_url,
    isActive: t.is_active,
    category: t.category,
    createdAt: t.created_at,
  }));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold">Choose a template</h1>
        <p className="text-muted-foreground">
          Your resume data is already filled in. Pick the look you want.
        </p>
      </div>
      <TemplateGallery templates={mapped} payments={payments} />
    </main>
  );
}
