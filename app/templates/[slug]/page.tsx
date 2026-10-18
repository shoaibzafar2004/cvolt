import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TemplatePreview from "./TemplatePreview";
import type { Template } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: t } = await supabase
    .from("templates")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!t) notFound();

  const template: Template = {
    id: t.id,
    name: t.name,
    slug: t.slug,
    thumbnailUrl: t.thumbnail_url,
    isActive: t.is_active,
    category: t.category,
    createdAt: t.created_at,
  };

  return <TemplatePreview template={template} />;
}
