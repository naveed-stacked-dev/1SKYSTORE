import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import image1 from '@/assets/1.jpg';
import image2 from '@/assets/2.jpg';
import image3 from '@/assets/3.jpg';

const CATEGORIES = [
  {
    title: 'Wellness & Daily Health',
    subtitle: 'Nourish your body daily',
    image: image1,
    panelClass: 'bg-slate-300 dark:bg-slate-900',
    slug: 'Beauty+%26+Personal+Care',
  },
  {
    title: 'Homeopathic',
    subtitle: 'Effective & Safe',
    image: image2,
    panelClass: 'bg-gradient-to-r from-primary-100 via-primary-50 to-primary-100 dark:from-primary-900 dark:via-neutral-900 dark:to-primary-900',
    slug: 'Homeopathic+Medicines',
  },
  {
    title: 'Immunity Boosters',
    subtitle: 'Protect your family',
    image: image3,
    panelClass: 'bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 dark:from-amber-950 dark:via-neutral-900 dark:to-orange-950',
    slug: 'Bio-Combination+Tablets',
  },
];

export default function BrandHeroGrid({ categories = CATEGORIES }) {
  const MotionDiv = motion.div;
  const [main, topRight, bottomRight] = categories;

  return (
    <section className="mx-auto w-full max-w-[1480px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <MotionDiv
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={`group relative aspect-[5/4] overflow-hidden rounded-[2rem] ${main.panelClass} shadow-sm transition-all duration-500 hover:shadow-card`}
        >
          <img
            src={main.image}
            alt={main.title}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/18 to-transparent" />

          <div className="relative z-10 flex h-full items-end p-7 sm:p-9 lg:p-9">
            <div className="max-w-md text-white transition-transform duration-500 group-hover:-translate-y-2">
              <h3 className="font-heading text-2xl font-bold leading-tight sm:text-2xl lg:text-[1.5rem]">
                {main.title}
              </h3>
              <p className="mt-3 text-base text-white/85 sm:text-lg">
                {main.subtitle}
              </p>
              <Link to={`/shop?category=${main.slug}`} className="mt-6 inline-flex">
          <Button
              size="sm"
              variant="ghost"
              className="group/btn rounded-2xl bg-white px-6 py-3 text-neutral-950 shadow-sm transition-all duration-300 hover:bg-primary-600 hover:text-white hover:shadow-glow"
            >
                  SHOP NOW <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </MotionDiv>

        <SideCard card={topRight} />
        <SideCard card={bottomRight} delay={0.08} />
      </div>
    </section>
  );
}

function SideCard({ card, delay = 0 }) {
  const MotionDiv = motion.div;

  return (
    <MotionDiv
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`group relative aspect-[5/4] overflow-hidden rounded-[2rem] ${card.panelClass} shadow-sm transition-all duration-500 hover:shadow-card`}
    >
      {/* Background Image */}
      <img
        src={card.image}
        alt={card.title}
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Overlay (same style as main card but lighter) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-end p-7 sm:p-9">
        <div className="max-w-xs text-white transition-transform duration-500 group-hover:-translate-y-2">
          <h3 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">
            {card.title}
          </h3>
          <p className="mt-3 text-sm text-white/85 sm:text-base">
            {card.subtitle}
          </p>

          <Link to={`/shop?category=${card.slug}`} className="mt-5 inline-flex">
            <Button
              size="sm"
              variant="ghost"
              className="group/btn rounded-2xl bg-white px-6 py-3 text-neutral-950 shadow-sm transition-all duration-300 hover:bg-primary-600 hover:text-white hover:shadow-glow"
            >
              SHOP NOW <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </MotionDiv>
  );
}