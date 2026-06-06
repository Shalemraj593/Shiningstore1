import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import WishlistDrawer from '@/components/WishlistDrawer';
import SearchModal from '@/components/SearchModal';
import Chatbot from '@/components/Chatbot';
import AuthModal from '@/components/AuthModal';
import HeroSection from '@/sections/HeroSection';
import FeaturesBar from '@/sections/FeaturesBar';
import CategoriesSection from '@/sections/CategoriesSection';
import TrendingSection from '@/sections/TrendingSection';
import FeaturedSection from '@/sections/FeaturedSection';
import TestimonialsSection from '@/sections/TestimonialsSection';
import InstagramSection from '@/sections/InstagramSection';
import NewsletterSection from '@/sections/NewsletterSection';
import Footer from '@/sections/Footer';

// Mobile Components
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileTopCategories from '@/components/mobile/MobileTopCategories';
import MobileHero from '@/components/mobile/MobileHero';
import MobileCoupon from '@/components/mobile/MobileCoupon';
import MobileSquareCategories from '@/components/mobile/MobileSquareCategories';
import MobileSaleBanner from '@/components/mobile/MobileSaleBanner';
import MobileProductGrid from '@/components/mobile/MobileProductGrid';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesBar />
          <CategoriesSection />
          <TrendingSection />
          <FeaturedSection />
          <TestimonialsSection />
          <InstagramSection />
          <NewsletterSection />
        </main>
        <Footer />
      </div>

      {/* Mobile Layout (Shein style with premium scheme) */}
      <div className="block md:hidden pb-20">
        <MobileHeader />
        <main>
          <MobileTopCategories />
          <MobileHero />
          <MobileCoupon />
          <MobileSquareCategories />
          <MobileSaleBanner />
          <MobileProductGrid />
        </main>
        <MobileBottomNav />
      </div>

      {/* Overlays (Shared) */}
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      <Chatbot />
      <AuthModal />
    </div>
  );
}
