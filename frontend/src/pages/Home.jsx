import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { SEO } from '@/constants/seo';
import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import ProductRail from '@/components/home/ProductRail';
import CampaignBanners from '@/components/home/CampaignBanners';
import ConcernRail from '@/components/home/ConcernRail';
import BrandStory from '@/components/home/BrandStory';
import WhyUs from '@/components/home/WhyUs';
import Bestsellers from '@/components/home/Bestsellers';
import BrandMarquee from '@/components/home/BrandMarquee';
import WellnessJournal from '@/components/home/WellnessJournal';
import Testimonials from '@/components/home/Testimonials';
import FinalCTA from '@/components/home/FinalCTA';

export default function Home() {
  useEffect(() => {
    document.title = SEO.home.title;
  }, []);

  return (
    // reducedMotion="user": transform animations are skipped for visitors who
    // ask their OS for less motion; opacity fades still play
    <MotionConfig reducedMotion="user">
      {/* overflow-x-clip (not hidden) keeps position: sticky working below */}
      <div className="overflow-x-clip bg-canvas text-ink">
        <Hero />
        <TrustStrip />
        <CategoryShowcase />
        <ProductRail />
        <CampaignBanners />
        <ConcernRail />
        <BrandStory />
        <WhyUs />
        <Bestsellers />
        <BrandMarquee />
        <WellnessJournal />
        <Testimonials />
        <FinalCTA />
      </div>
    </MotionConfig>
  );
}
