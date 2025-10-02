import { DmcaReportsList } from "@/components/admin/dmca-reports-list";

export default function AdminDmcaPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">DMCA Reports</h1>
        <p className="text-muted-foreground mb-8">
          Review and manage DMCA takedown requests submitted by copyright holders.
        </p>

        <DmcaReportsList />
      </div>
    </div>
  );
}