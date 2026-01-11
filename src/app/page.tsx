import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />

        {/* Portfolio/Examples Section Placeholder */}
        <section id="examples" className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
                Portfolio
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                See Our Work
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Check out some of the websites we have built for small businesses like yours.
              </p>
            </div>
            {/* Portfolio items will be added here */}
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="group relative overflow-hidden rounded-2xl bg-gray-100"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300" />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/0 transition-all group-hover:bg-gray-900/60">
                    <span className="translate-y-4 text-lg font-semibold text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      Coming Soon
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Intake Form Section Placeholder */}
        <section id="get-started" className="bg-gradient-to-b from-gray-50 to-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-700">
                Get Started
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Ready to Build Your Website?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Tell us about your business and we will create a custom website just for you.
              </p>
            </div>
            {/* Intake form will be added here */}
            <div className="mx-auto mt-12 max-w-xl">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="space-y-6">
                  <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mt-2 text-sm font-medium text-gray-600">
                        Intake Form Coming Soon
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Contact us at hello@sitestart.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
