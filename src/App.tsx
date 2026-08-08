import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar        from './components/Navbar.tsx'
import HeroSection   from './components/HeroSection.tsx'
import VenueFeatures from './components/VenueFeatures.tsx'
import Services      from './components/Services.tsx'
import QuotationForm from './components/QuotationForm.tsx'
import Testimonials  from './components/Testimonials.tsx'
import BusinessInfo  from './components/BusinessInfo.tsx'
import AccentBand    from './components/AccentBand.tsx'
import Footer        from './components/Footer.tsx'
import AgendaPage    from './pages/AgendaPage.tsx'

function LandingPage() {
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(true), 150)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="min-h-screen bg-bone-dark text-typesetter-frost">
      <Navbar />
      <main>
        <HeroSection />
        <VenueFeatures />
        <Services />
        <QuotationForm />
        <Testimonials />
        <BusinessInfo />
        <AccentBand />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
      </Routes>
    </BrowserRouter>
  )
}
