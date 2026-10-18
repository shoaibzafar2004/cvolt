import { Suspense } from "react";
import AuthGate from "@/components/shared/AuthGate";
import DashboardLoading from "./loading";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}
