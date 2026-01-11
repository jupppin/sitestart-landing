export default function Features() {
  const features = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
      title: 'AI-Powered Design',
      description: 'Modern, professional designs tailored specifically to your business. Our AI understands your industry and creates a unique look that stands out.',
      color: 'blue',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      title: 'Fast Turnaround',
      description: 'Get your site live in days, not weeks. While others make you wait months, we deliver quickly so you can start attracting customers sooner.',
      color: 'teal',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
      title: 'Affordable Pricing',
      description: 'Small business friendly pricing that fits your budget. No hidden fees, no surprise charges. Get enterprise-quality websites at a fraction of the cost.',
      color: 'blue',
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: 'No Maintenance Hassle',
      description: 'We handle updates, security, and hosting so you can focus on what matters - running your business. Sit back while we keep everything running smoothly.',
      color: 'teal',
    },
  ];

  const getColorClasses = (color: string) => {
    if (color === 'blue') {
      return {
        bg: 'bg-blue-50',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        hoverBorder: 'hover:border-blue-200',
      };
    }
    return {
      bg: 'bg-teal-50',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      hoverBorder: 'hover:border-teal-200',
    };
  };

  return (
    <section id="features" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
            Features
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Why Choose SiteStart?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            We make building a professional website simple, fast, and affordable for small businesses.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:gap-12">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            return (
              <div
                key={index}
                className={`group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg ${colors.hoverBorder}`}
              >
                {/* Icon */}
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg} ${colors.iconColor}`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-gray-600">
                  {feature.description}
                </p>

                {/* Decorative corner */}
                <div className={`absolute right-0 top-0 h-24 w-24 translate-x-1/2 -translate-y-1/2 rounded-full ${colors.bg} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
