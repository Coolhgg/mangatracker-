"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DmcaReport {
  id: number;
  reporterName: string;
  reporterEmail: string;
  reporterOrganization?: string;
  contentType: string;
  contentUrl?: string;
  complaintDetails: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
}

export default function DmcaReportsViewer() {
  const [reports, setReports] = useState<DmcaReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/dmca-reports');
      
      if (!response.ok) {
        throw new Error('Failed to fetch DMCA reports');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error("Failed to fetch DMCA reports:", error);
      setError(error instanceof Error ? error.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: number, newStatus: string) => {
    setUpdating(reportId);
    try {
      const response = await fetch(`/api/admin/dmca-reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      toast.success(`Report ${reportId} marked as ${newStatus}`);
      await fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Failed to update report:', error);
      toast.error('Failed to update report status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "reviewing":
        return "bg-blue-500/10 text-blue-500";
      case "resolved":
        return "bg-green-500/10 text-green-500";
      case "rejected":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const filteredReports = reports.filter((report) => {
    if (filter === "all") return true;
    return report.status === filter;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-12 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchReports}>Retry</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">DMCA Reports</h2>
        <div className="flex gap-2">
          {["all", "pending", "reviewing", "resolved", "rejected"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No DMCA reports found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Report #{report.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.createdAt).toLocaleDateString()} at{" "}
                    {new Date(report.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reporter</p>
                  <p className="text-sm">
                    {report.reporterName}
                    {report.reporterOrganization && ` (${report.reporterOrganization})`}
                  </p>
                  <p className="text-sm text-muted-foreground">{report.reporterEmail}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Content Type</p>
                  <p className="text-sm capitalize">{report.contentType}</p>
                </div>

                {report.contentUrl && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Content URL</p>
                    <a
                      href={report.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {report.contentUrl}
                    </a>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Complaint Details</p>
                  <p className="text-sm bg-muted p-3 rounded-md">{report.complaintDetails}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {report.status !== 'reviewing' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateReportStatus(report.id, 'reviewing')}
                    disabled={updating === report.id}
                  >
                    {updating === report.id ? 'Updating...' : 'Mark as Reviewing'}
                  </Button>
                )}
                {report.status !== 'resolved' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateReportStatus(report.id, 'resolved')}
                    disabled={updating === report.id}
                  >
                    {updating === report.id ? 'Updating...' : 'Resolve'}
                  </Button>
                )}
                {report.status !== 'rejected' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateReportStatus(report.id, 'rejected')}
                    disabled={updating === report.id}
                  >
                    {updating === report.id ? 'Updating...' : 'Reject'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}