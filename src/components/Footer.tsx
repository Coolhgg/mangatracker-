export const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-5">
        <div className="md:col-span-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/dark-logo-BzMF6V4R-2.svg?" alt="Kenmei" className="h-6 w-auto" />
          <p className="mt-3 text-sm text-muted-foreground">Your favourite tracker for discovering and tracking new series.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#">Supported Sites</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="#">About</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Resources</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#">Suggestions</a></li>
            <li><a href="#">Changelog</a></li>
            <li><a href="#">Status</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="/legal/cookies">Cookies</a></li>
            <li><a href="/legal/privacy">Privacy</a></li>
            <li><a href="/legal/terms">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Kenmei. All rights reserved.</div>
    </footer>
  );
};