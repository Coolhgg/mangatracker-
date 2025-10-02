"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function DmcaForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reporterName: "",
    reporterEmail: "",
    reporterOrganization: "",
    contentType: "series",
    contentUrl: "",
    complaintDetails: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reports/dmca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "DMCA report submitted successfully");
        setFormData({
          reporterName: "",
          reporterEmail: "",
          reporterOrganization: "",
          contentType: "series",
          contentUrl: "",
          complaintDetails: "",
        });
      } else {
        toast.error(data.error || "Failed to submit DMCA report");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="reporterName">Your Name *</Label>
        <Input
          id="reporterName"
          required
          value={formData.reporterName}
          onChange={(e) =>
            setFormData({ ...formData, reporterName: e.target.value })
          }
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reporterEmail">Your Email *</Label>
        <Input
          id="reporterEmail"
          type="email"
          required
          value={formData.reporterEmail}
          onChange={(e) =>
            setFormData({ ...formData, reporterEmail: e.target.value })
          }
          placeholder="john@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reporterOrganization">Organization (Optional)</Label>
        <Input
          id="reporterOrganization"
          value={formData.reporterOrganization}
          onChange={(e) =>
            setFormData({ ...formData, reporterOrganization: e.target.value })
          }
          placeholder="Company name or rights holder"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contentType">Content Type *</Label>
        <Select
          value={formData.contentType}
          onValueChange={(value) =>
            setFormData({ ...formData, contentType: value })
          }
        >
          <SelectTrigger id="contentType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="series">Series</SelectItem>
            <SelectItem value="chapter">Chapter</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contentUrl">Content URL (Optional)</Label>
        <Input
          id="contentUrl"
          type="url"
          value={formData.contentUrl}
          onChange={(e) =>
            setFormData({ ...formData, contentUrl: e.target.value })
          }
          placeholder="https://kenmei.co/series/example"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="complaintDetails">Complaint Details *</Label>
        <Textarea
          id="complaintDetails"
          required
          rows={6}
          value={formData.complaintDetails}
          onChange={(e) =>
            setFormData({ ...formData, complaintDetails: e.target.value })
          }
          placeholder="Provide detailed information about the copyright infringement, including the copyrighted work, where the infringement is located, and your relationship to the copyright owner."
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit DMCA Report"}
      </Button>

      <p className="text-sm text-muted-foreground">
        * Required fields. By submitting this form, you confirm that you have a
        good faith belief that the use of the material is not authorized by the
        copyright owner, and that the information provided is accurate.
      </p>
    </form>
  );
}