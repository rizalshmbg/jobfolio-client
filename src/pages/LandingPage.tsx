import LandingNav from '@components/landing/LandingNav';
import HeroSection from '@components/landing/HeroSection';
import ProductReview from '@components/landing/ProductReview';
import FeaturesSection from '@components/landing/FeaturesSection';
import HowItWorksSection from '@components/landing/HowItWorksSection';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className='landing'>
      <LandingNav />

      <main>
        <HeroSection />
        <ProductReview />
        <FeaturesSection />
        <HowItWorksSection />
        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
