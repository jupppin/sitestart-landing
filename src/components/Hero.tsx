'use client';

export default function Hero() {
  const handleGetStarted = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('get-started');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const trustIndicators = [
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: 'No tech skills needed',
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: 'Launch in days',
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: 'Affordable pricing',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 transform">
          <div className="h-96 w-96 rounded-full bg-blue-100 opacity-50 blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 transform">
          <div className="h-96 w-96 rounded-full bg-teal-100 opacity-50 blur-3xl" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            AI-Powered Website Builder
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Your Small Business Deserves a{' '}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Professional Website
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-8 text-gray-600 md:text-xl">
            We use AI to build beautiful, effective websites - fast and affordable.
            Focus on running your business while we handle your online presence.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#get-started"
              onClick={handleGetStarted}
              className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 sm:w-auto"
            >
              Start Building Your Site
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
            >
              See How It Works
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
            {trustIndicators.map((indicator, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-gray-600"
              >
                <span className="text-teal-500">{indicator.icon}</span>
                <span className="text-sm font-medium">{indicator.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Image/Illustration Placeholder */}
        <div className="mt-16 md:mt-20">
          <div className="relative mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-gray-700 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div className="ml-4 flex-1 rounded bg-gray-700 py-1 px-3 text-xs text-gray-400">
                  yourbusiness.com
                </div>
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="h-16 w-16 rounded-xl bg-blue-600/10 flex items-center justify-center">
                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-48 rounded bg-gray-300" />
                    <div className="h-3 w-64 rounded bg-gray-200" />
                  </div>
                  <div className="mt-2 h-10 w-32 rounded-full bg-blue-600" />
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-xl bg-teal-500/10 backdrop-blur-sm" />
            <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-xl bg-blue-500/10 backdrop-blur-sm" />
          </div>
        </div>
      </div>
    </section>
  );
}
