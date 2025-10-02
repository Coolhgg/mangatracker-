"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DmcaReport {
  id: number;
  reporterName: string;
  reporterEmail: string;
  contentType: string;
  contentUrl: string | null;
  status: string;
  createdAt: string;
}

export function DmcaReportsList() {
  const [reports, setReports] = useState<DmcaReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports/dmca?status=${filter}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error("Failed to fetch DMCA reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "reviewing":
        return "bg-blue-500";
      case "resolved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
          size="sm"
        >
          Pending
        </Button>
        <Button
          variant={filter === "reviewing" ? "default" : "outline"}
          onClick={() => setFilter("reviewing")}
          size="sm"
        >
          Reviewing
        </Button>
        <Button
          variant={filter === "resolved" ? "default" : "outline"}
          onClick={() => setFilter("resolved")}
          size="sm"
        >
          Resolved
        </Button>
        <Button
          variant={filter === "rejected" ? "default" : "outline"}
          onClick={() => setFilter("rejected")}
          size="sm"
        >
          Rejected
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No {filter} reports found
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Content Type</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>{report.reporterName}</TableCell>
                  <TableCell className="text-sm">{report.reporterEmail}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.contentType}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {report.contentUrl || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}