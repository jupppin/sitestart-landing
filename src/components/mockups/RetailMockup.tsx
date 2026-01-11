export default function RetailMockup() {
  return (
    <div className="min-h-[400px] w-full overflow-hidden bg-stone-50 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500">
            <span className="text-xs font-bold text-white">U</span>
          </div>
          <span className="text-sm font-semibold text-stone-800">Urban Style Boutique</span>
        </div>
        <div className="flex items-center gap-3">
          <svg className="h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div className="relative">
            <svg className="h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 text-[8px] text-white">2</span>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-100 to-pink-100 px-4 py-3 text-center">
        <p className="text-xs font-medium text-rose-700">
          New Season Collection - 20% Off!
        </p>
      </div>

      {/* Product Grid */}
      <div className="p-4">
        <h2 className="mb-3 text-sm font-bold text-stone-800">Featured Products</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Product 1 */}
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="relative h-20 bg-gradient-to-br from-rose-200 via-pink-100 to-rose-300">
              <span className="absolute left-1 top-1 rounded bg-rose-500 px-1 py-0.5 text-[8px] font-bold text-white">NEW</span>
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-stone-800">Summer Dress</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600">$49.99</span>
                <div className="flex gap-0.5">
                  <div className="h-2 w-2 rounded-full bg-rose-300" />
                  <div className="h-2 w-2 rounded-full bg-stone-300" />
                  <div className="h-2 w-2 rounded-full bg-sky-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Product 2 */}
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="h-20 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300" />
            <div className="p-2">
              <p className="text-xs font-medium text-stone-800">Linen Blazer</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600">$89.99</span>
                <div className="flex gap-0.5">
                  <div className="h-2 w-2 rounded-full bg-stone-400" />
                  <div className="h-2 w-2 rounded-full bg-stone-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Product 3 */}
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="h-20 bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200" />
            <div className="p-2">
              <p className="text-xs font-medium text-stone-800">Silk Scarf</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600">$34.99</span>
                <div className="flex gap-0.5">
                  <div className="h-2 w-2 rounded-full bg-sky-300" />
                  <div className="h-2 w-2 rounded-full bg-rose-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Product 4 */}
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="relative h-20 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200">
              <span className="absolute left-1 top-1 rounded bg-amber-500 px-1 py-0.5 text-[8px] font-bold text-white">SALE</span>
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-stone-800">Canvas Tote</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-stone-400 line-through">$45.99</span>
                  <span className="text-xs font-bold text-rose-600">$29.99</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <button className="w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:from-rose-600 hover:to-pink-600">
          Shop Now
        </button>
      </div>
    </div>
  );
}
