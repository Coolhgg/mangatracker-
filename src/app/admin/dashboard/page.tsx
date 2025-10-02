import { Suspense } from "react";
import DmcaReportsViewer from "@/components/admin/DmcaReportsViewer";
import { Card } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Series</h3>
            <p className="text-3xl font-bold mt-2">1,234</p>
            <p className="text-xs text-muted-foreground mt-1">+12 this week</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
            <p className="text-3xl font-bold mt-2">5,678</p>
            <p className="text-xs text-muted-foreground mt-1">+234 this month</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Pending DMCA</h3>
            <p className="text-3xl font-bold mt-2">3</p>
            <p className="text-xs text-yellow-500 mt-1">Requires attention</p>
          </Card>
        </div>

        <Suspense
          fallback={
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </Card>
              ))}
            </div>
          }
        >
          <DmcaReportsViewer />
        </Suspense>
      </div>
    </div>
  );
}