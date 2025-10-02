import { DmcaForm } from "@/components/legal/dmca-form";

export default function DmcaPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">DMCA Takedown Request</h1>
        
        <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
          <p className="text-muted-foreground">
            Kenmei respects the intellectual property rights of others and expects our users to do the same. 
            If you believe that content available through our service infringes your copyright, please submit 
            a DMCA takedown notice using the form below.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Requirements</h2>
          <p className="text-muted-foreground">
            Your DMCA notice must include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Identification of the copyrighted work you claim has been infringed</li>
            <li>Identification of the material claimed to be infringing (URL or description)</li>
            <li>Your contact information (name, email, organization if applicable)</li>
            <li>A statement that you have a good faith belief that the use is not authorized</li>
            <li>A statement that the information in the notice is accurate</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">What Happens Next?</h2>
          <p className="text-muted-foreground">
            Once we receive your valid DMCA notice:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>We will review your submission within 24-48 hours</li>
            <li>If valid, we will remove or disable access to the allegedly infringing content</li>
            <li>We will notify the content provider of the removal</li>
            <li>The provider may submit a counter-notice if they believe the removal was in error</li>
          </ol>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">Important Notice</p>
            <p className="text-sm text-muted-foreground mt-2">
              Under Section 512(f) of the DMCA, any person who knowingly materially misrepresents 
              that material or activity is infringing may be subject to liability. Please ensure 
              all information provided is accurate.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Submit Takedown Request</h2>
          <DmcaForm />
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          <p>
            For questions or concerns, contact us at{" "}
            <a href="mailto:dmca@kenmei.co" className="text-primary hover:underline">
              dmca@kenmei.co
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}