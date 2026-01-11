export default function RestaurantMockup() {
  return (
    <div className="min-h-[400px] w-full overflow-hidden bg-amber-50 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between bg-amber-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
            <span className="text-xs font-bold text-amber-900">B</span>
          </div>
          <span className="text-sm font-semibold text-amber-100">Bella&apos;s Kitchen</span>
        </div>
        <nav className="flex gap-3">
          <span className="text-xs text-amber-200">Menu</span>
          <span className="text-xs text-amber-200">About</span>
          <span className="text-xs text-amber-200">Contact</span>
        </nav>
      </header>

      {/* Hero */}
      <div className="relative h-28 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h1 className="text-lg font-bold text-white drop-shadow-md">
            Authentic Italian Cuisine
          </h1>
          <p className="mt-1 text-xs text-amber-100">
            Fresh ingredients, family recipes
          </p>
        </div>
        {/* Decorative food shapes */}
        <div className="absolute bottom-2 left-4 h-8 w-8 rounded-full bg-amber-300/40" />
        <div className="absolute right-6 top-4 h-6 w-6 rounded-full bg-orange-400/30" />
        <div className="absolute bottom-4 right-8 h-4 w-4 rounded-full bg-amber-200/30" />
      </div>

      {/* Menu Section */}
      <div className="p-4">
        <h2 className="mb-3 text-center text-sm font-bold text-amber-900">
          Today&apos;s Specials
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {/* Menu Item 1 */}
          <div className="rounded-lg bg-white p-2 shadow-sm">
            <div className="mb-1 h-10 rounded bg-gradient-to-br from-orange-200 to-amber-300" />
            <p className="text-xs font-medium text-amber-900">Margherita Pizza</p>
            <p className="text-xs font-bold text-amber-700">$14.99</p>
          </div>
          {/* Menu Item 2 */}
          <div className="rounded-lg bg-white p-2 shadow-sm">
            <div className="mb-1 h-10 rounded bg-gradient-to-br from-amber-200 to-orange-300" />
            <p className="text-xs font-medium text-amber-900">Pasta Carbonara</p>
            <p className="text-xs font-bold text-amber-700">$16.99</p>
          </div>
          {/* Menu Item 3 */}
          <div className="rounded-lg bg-white p-2 shadow-sm">
            <div className="mb-1 h-10 rounded bg-gradient-to-br from-red-200 to-orange-200" />
            <p className="text-xs font-medium text-amber-900">Bruschetta</p>
            <p className="text-xs font-bold text-amber-700">$8.99</p>
          </div>
          {/* Menu Item 4 */}
          <div className="rounded-lg bg-white p-2 shadow-sm">
            <div className="mb-1 h-10 rounded bg-gradient-to-br from-amber-300 to-yellow-200" />
            <p className="text-xs font-medium text-amber-900">Tiramisu</p>
            <p className="text-xs font-bold text-amber-700">$7.99</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4 text-center">
        <button className="w-full rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-amber-700">
          Order Now
        </button>
      </div>
    </div>
  );
}
