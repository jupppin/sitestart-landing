'use client';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Tell Us About Your Business',
      description: 'Fill out our quick intake form with details about your business, goals, and preferences. It only takes a few minutes.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'We Design & Build',
      description: 'Our AI analyzes your needs and creates a custom website design. We handle all the technical work - no coding required from you.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Launch & Grow',
      description: 'Review your site, request any changes, and go live. Start attracting customers with your new professional online presence.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      ),
    },
  ];

  const handleGetStarted = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('get-started');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="how-it-works" className="bg-gray-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-700">
            Simple Process
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Getting your professional website is easier than you think. Just three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16">
          <div className="relative">
            {/* Connection Line - Desktop */}
            <div className="absolute left-0 right-0 top-24 hidden h-0.5 bg-gradient-to-r from-blue-200 via-teal-200 to-blue-200 lg:block" />

            <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step Card */}
                  <div className="relative flex flex-col items-center text-center">
                    {/* Number Badge */}
                    <div className="relative z-10 mb-6">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg shadow-gray-200/50 ring-1 ring-gray-100">
                        <span className={`text-2xl font-bold ${
                          index === 0 ? 'text-blue-600' :
                          index === 1 ? 'text-teal-600' :
                          'text-blue-600'
                        }`}>
                          {step.number}
                        </span>
                      </div>
                      {/* Step indicator dot */}
                      <div className={`absolute -bottom-3 left-1/2 hidden h-3 w-3 -translate-x-1/2 rounded-full lg:block ${
                        index === 0 ? 'bg-blue-600' :
                        index === 1 ? 'bg-teal-500' :
                        'bg-blue-600'
                      }`} />
                    </div>

                    {/* Icon */}
                    <div className={`mb-4 rounded-xl p-3 ${
                      index === 0 ? 'bg-blue-50 text-blue-600' :
                      index === 1 ? 'bg-teal-50 text-teal-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {step.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-gray-600">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="mt-8 flex justify-center lg:hidden">
                      <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="#get-started"
            onClick={handleGetStarted}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
          >
            Start Your Project Today
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
