import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { shapeDbRowToResumeData, type DbResume } from "@/lib/utils";
import EditFormShell from "./EditFormShell";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnTo=/dashboard");

  // Fetch resume that belongs to this user
  const { data: resume } = await supabase
    .from("resumes")
    .select(
      `
      id,
      purchased,
      personal_info,
      resume_sections ( id, section_type, content, display_order )
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!resume) notFound();
  // Drafts are edited in /build; this page edits a purchase's own resume
  if (!resume.purchased) redirect("/build");

  const { data: snapshot } = await supabase
    .from("resume_snapshots")
    .select(
      "payment_id, payments!resume_snapshots_payment_id_fkey ( template_id )",
    )
    .eq("resume_id", resume.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!snapshot) notFound();

  const resumeData = shapeDbRowToResumeData(resume as DbResume);

  return (
    <EditFormShell
      resumeId={resume.id}
      paymentId={snapshot.payment_id}
      templateId={
        (
          (Array.isArray(snapshot.payments)
            ? snapshot.payments[0]
            : snapshot.payments) as { template_id: string } | null
        )?.template_id ?? ""
      }
      resumeData={resumeData}
    />
  );
}
