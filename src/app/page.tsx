import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Portfolio from "@/components/Portfolio";
import IntakeForm from "@/components/IntakeForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Portfolio />

        {/* Intake Form Section */}
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
            <div className="mx-auto mt-12 max-w-2xl">
              <IntakeForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
