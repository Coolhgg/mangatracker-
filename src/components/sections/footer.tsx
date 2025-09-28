import Link from 'next/link';

const Footer = () => {
  return (
    <footer
      className="relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/bg-footer-18.png?')",
      }}
    >
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Logo and Tagline */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block">
              <img
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/svgs/dark-logo-BzMF6V4R-2.svg?"
                alt="Kenmei Logo"
                width={88}
                height={28}
                className="h-7 w-auto"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-gray-300">
              Your favourite tracker for discovering and tracking new series.
            </p>
          </div>

          {/* Link Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {/* Product Column */}
            <div>
              <h3 className="text-sm font-semibold text-white">Product</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="https://www.kenmei.co/supported-sites" className="text-sm text-gray-300 transition-colors hover:text-white">Supported Sites</a></li>
                <li><a href="https://www.kenmei.co/pricing" className="text-sm text-gray-300 transition-colors hover:text-white">Pricing</a></li>
                <li><a href="https://www.kenmei.co/about" className="text-sm text-gray-300 transition-colors hover:text-white">About</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-sm font-semibold text-white">Resources</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="https://www.kenmei.co/suggestions" className="text-sm text-gray-300 transition-colors hover:text-white">Suggestions</a></li>
                <li><a href="https://www.kenmei.co/changelog" className="text-sm text-gray-300 transition-colors hover:text-white">Changelog</a></li>
                <li><a href="https://www.kenmei.co/status" className="text-sm text-gray-300 transition-colors hover:text-white">Status</a></li>
                <li><a href="https://www.kenmei.co/blog" className="text-sm text-gray-300 transition-colors hover:text-white">Blog</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="text-sm font-semibold text-white">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="https://www.kenmei.co/cookies" className="text-sm text-gray-300 transition-colors hover:text-white">Cookies</a></li>
                <li><a href="https://www.kenmei.co/privacy" className="text-sm text-gray-300 transition-colors hover:text-white">Privacy</a></li>
                <li><a href="https://www.kenmei.co/terms" className="text-sm text-gray-300 transition-colors hover:text-white">Terms</a></li>
                <li><Link href="/legal/dmca" className="text-sm text-gray-300 transition-colors hover:text-white">DMCA</Link></li>
              </ul>
            </div>

            {/* Social Column */}
            <div>
              <h3 className="text-sm font-semibold text-white">Social</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="https://discord.gg/XeTFtYW" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 transition-colors hover:text-white">Discord</a></li>
                <li><a href="https://twitter.com/KenmeiApp" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 transition-colors hover:text-white">X</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;