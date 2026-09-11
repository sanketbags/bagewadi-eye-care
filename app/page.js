import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Trust from "@/components/Trust";
import About from "@/components/About";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BookingSection from "@/components/BookingSection";

export default async function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Trust />
      <About />
      <Services />
      <BookingSection />
      <Contact />
      <Footer />
    </>
  );
}
