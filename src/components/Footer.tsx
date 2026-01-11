export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <a href="#" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">SiteStart</span>
            </a>
            <p className="text-sm text-gray-500">
              AI-powered websites for small businesses
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center gap-2 text-center md:items-end md:text-right">
            <p className="text-sm">
              Questions?{' '}
              <a
                href="mailto:hello@sitestart.com"
                className="font-medium text-gray-300 transition-colors hover:text-white"
              >
                hello@sitestart.com
              </a>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-sm md:flex-row">
            <p>
              &copy; {currentYear} SiteStart. All rights reserved.
            </p>
            <p className="flex items-center gap-1 text-gray-500">
              Made with
              <svg
                className="h-4 w-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              by SiteStart
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
