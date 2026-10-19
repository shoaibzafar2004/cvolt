import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getPurchase,
  getServiceClient,
  pdfHash,
  pdfPath,
  reeditStatus,
  renderAndStorePdf,
} from "@/lib/purchases";

// Rendering a re-edited PDF launches Chromium
export const maxDuration = 60;

interface Props {
  params: Promise<{ paymentId: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { paymentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?returnTo=/api/download-pdf/${paymentId}`);

  const service = getServiceClient();
  const purchase = await getPurchase(service, paymentId, user.id);
  if (!purchase) return new Response("Not found", { status: 404 });

  // Same rules as /dashboard/download/[id], enforced here too so the link
  // can't be used to skip them
  const status = reeditStatus(purchase);
  if (status.expired)
    return new Response("Download link expired", { status: 410 });
  if (!status.free)
    return new Response("Changes exceed the free re-edit limit", {
      status: 402,
    });

  // Free re-edit: re-render when the resume no longer matches the stored PDF
  if (purchase.pdfHash !== pdfHash(purchase.slug, purchase.current)) {
    await renderAndStorePdf(service, {
      userId: purchase.userId,
      paymentId,
      slug: purchase.slug,
      data: purchase.current,
    });
  }

  const { data: signed } = await service.storage
    .from("pdfs")
    .createSignedUrl(pdfPath(purchase.userId, paymentId), 60);
  if (!signed?.signedUrl) return new Response("PDF not found", { status: 404 });

  const purchaseDate = purchase.purchasedAt.slice(0, 10); // YYYY-MM-DD
  const safeName = (purchase.current.personalInfo.name || "resume")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  const filename = `${safeName}-${purchaseDate}.pdf`;

  // Fetch from Supabase storage and stream back with Content-Disposition: attachment
  const pdfRes = await fetch(signed.signedUrl);
  if (!pdfRes.ok) return new Response("PDF unavailable", { status: 502 });

  return new Response(pdfRes.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
