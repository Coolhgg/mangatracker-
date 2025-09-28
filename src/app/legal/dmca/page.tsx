import type { Metadata } from "next";
import DmcaForm from "@/components/legal/DmcaForm";

export const metadata: Metadata = {
  title: "DMCA Takedown | Kenmei",
  description: "Submit a DMCA takedown request for infringing content discovered via Kenmei.",
};

export default function DmcaPage() {
  return (
    <div className="min-h-[60vh] bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight">DMCA Takedown Request</h1>
          <p className="mt-4 text-muted-foreground">
            If you are a copyright owner (or an agent thereof) and believe that content accessible
            through our service infringes your copyright, please complete the form below. We will
            review your request and take appropriate action.
          </p>
        </div>

        <div className="mt-10">
          <DmcaForm />
        </div>

        <div className="mx-auto mt-12 max-w-3xl text-xs text-muted-foreground">
          <p>
            By submitting this request, you affirm that the information provided is accurate and that you are
            authorized to act on behalf of the copyright owner. Submitting fraudulent claims may result in
            liability for damages, including costs and attorneys’ fees.
          </p>
        </div>
      </div>
    </div>
  );
}