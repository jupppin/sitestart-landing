export default function HomeServicesMockup() {
  return (
    <div className="h-[400px] w-[320px] overflow-hidden bg-slate-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between bg-blue-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-orange-500">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">Quick Fix Plumbing</span>
        </div>
        <span className="rounded bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">24/7</span>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-5">
        <h1 className="text-lg font-bold text-white">
          Fast & Reliable Plumbing
        </h1>
        <p className="mt-1 text-xs text-blue-200">
          Emergency service available around the clock
        </p>
        <button className="mt-3 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-colors hover:bg-orange-600">
          Book Now - Free Quote
        </button>
      </div>

      {/* Services Grid */}
      <div className="p-4">
        <h2 className="mb-3 text-sm font-bold text-slate-800">Our Services</h2>
        <div className="grid grid-cols-3 gap-2">
          {/* Service 1 */}
          <div className="flex flex-col items-center rounded-lg bg-white p-2 text-center shadow-sm">
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <div className="h-4 w-4 rounded-full bg-blue-500" />
            </div>
            <span className="text-[10px] text-slate-600">Leak Repair</span>
          </div>
          {/* Service 2 */}
          <div className="flex flex-col items-center rounded-lg bg-white p-2 text-center shadow-sm">
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <div className="h-4 w-4 rounded bg-orange-500" />
            </div>
            <span className="text-[10px] text-slate-600">Drain Clean</span>
          </div>
          {/* Service 3 */}
          <div className="flex flex-col items-center rounded-lg bg-white p-2 text-center shadow-sm">
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <div className="h-2 w-4 rounded bg-blue-500" />
            </div>
            <span className="text-[10px] text-slate-600">Installation</span>
          </div>
          {/* Service 4 */}
          <div className="flex flex-col items-center rounded-lg bg-white p-2 text-center shadow-sm">
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <div className="h-4 w-2 rounded bg-orange-500" />
            </div>
            <span className="text-[10px] text-slate-600">Water Heater</span>
          </div>
          {/* Service 5 */}
          <div className="flex flex-col items-center rounded-lg bg-white p-2 text-center shadow-sm">
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <div className="h-3 w-3 rotate-45 bg-blue-500" />
            </div>
            <span className="text-[10px] text-slate-600">Emergency</span>
          </div>
          {/* Service 6 */}
          <div className="flex flex-col items-center rounded-lg bg-white p-2 text-center shadow-sm">
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <div className="h-4 w-4 rounded-sm bg-orange-500" />
            </div>
            <span className="text-[10px] text-slate-600">Inspection</span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mx-4 mb-4 flex justify-between rounded-lg bg-blue-800 px-3 py-2">
        <div className="flex items-center gap-1">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
            <svg className="h-3 w-3 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-[9px] font-semibold text-white">Licensed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
            <svg className="h-3 w-3 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-[9px] font-semibold text-white">Insured</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500">
            <span className="text-[8px] font-bold text-white">24/7</span>
          </div>
          <span className="text-[9px] font-semibold text-white">Available</span>
        </div>
      </div>
    </div>
  );
}
