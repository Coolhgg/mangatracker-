"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SourcesAdmin } from "@/components/admin/sources-admin";
import ReportsAdmin from "@/components/admin/reports-admin";

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login?redirect=/admin");
  }, [isPending, session, router]);

  if (isPending) return <div className="p-8">Loading...</div>;
  if (!session?.user) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Admin</h1>
      <p className="text-muted-foreground mb-6">Moderate sources and community.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-3">Sources</h2>
          {/* Sources admin with optimistic trust updates and sync triggers */}
          <SourcesAdmin />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-3">Reports</h2>
          {/* Reports admin with filters and resolve/reject actions */}
          <ReportsAdmin />
        </div>
      </div>
    </div>
  );
}