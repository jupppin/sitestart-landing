export default function ProfessionalMockup() {
  return (
    <div className="min-h-[400px] w-full overflow-hidden bg-slate-50 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between bg-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500">
            <span className="text-xs font-bold text-white">SC</span>
          </div>
          <span className="text-sm font-semibold text-white">Smith Consulting</span>
        </div>
        <nav className="flex gap-3">
          <span className="text-xs text-slate-300">Services</span>
          <span className="text-xs text-slate-300">About</span>
          <span className="text-xs text-slate-300">Contact</span>
        </nav>
      </header>

      {/* Hero with Profile */}
      <div className="bg-gradient-to-b from-slate-100 to-white px-4 py-6">
        <div className="flex items-center gap-4">
          {/* Professional Headshot Placeholder */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-400">
            <svg className="h-8 w-8 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">
              Business Solutions Expert
            </h1>
            <p className="text-xs text-slate-600">
              Helping companies grow since 2005
            </p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="px-4 py-4">
        <h2 className="mb-3 text-sm font-bold text-slate-800">Our Services</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100">
              <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-slate-700">Strategic Business Planning</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100">
              <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-slate-700">Financial Consulting</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100">
              <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-slate-700">Operations Optimization</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100">
              <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-slate-700">Market Analysis & Research</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-blue-700">
          Contact Us
        </button>
      </div>
    </div>
  );
}
