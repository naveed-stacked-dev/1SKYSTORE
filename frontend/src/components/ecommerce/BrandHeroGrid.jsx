import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

// Dummy placeholder categories for the Brand Hero Grid layout
const CATEGORIES = [
  {
    title: 'Wellness & Daily Health',
    subtitle: 'Nourish your body daily',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop', // Yoga/Wellness
    color: 'bg-primary-100 dark:bg-primary-900',
    slug: 'wellness',
  },
  {
    title: 'Beauty & Skincare',
    subtitle: 'Natural radiant glow',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop', // Cosmetics/Serums
    color: 'bg-secondary-100 dark:bg-secondary-900',
    slug: 'beauty',
  },
  {
    title: 'Immunity Boosters',
    subtitle: 'Protect your family',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop', // Pills/Capsules
    color: 'bg-orange-100 dark:bg-orange-900/50',
    slug: 'immunity',
  },
];

export default function BrandHeroGrid({ categories = CATEGORIES }) {
  const [main, topRight, bottomRight] = categories;

  return (
    <div className="w-full py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px]">
        {/* Left Large Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={`relative rounded-3xl overflow-hidden ${main.color} flex items-end p-8 group cursor-pointer hover:shadow-card transition-all duration-500`}
        >
          {/* Background Image with Parallax */}
          <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
            <img 
              src={main.image} 
              alt={main.title} 
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>

            <div className="relative z-10 text-white pb-4 group-hover:-translate-y-2 transition-transform duration-500 ease-out">
            <h3 className="text-3xl md:text-5xl font-heading font-bold mb-3">{main.title}</h3>
            <p className="text-lg text-white/80 mb-6">{main.subtitle}</p>
            <Link to={`/category/${main.slug}`}>
              <Button size="lg" variant="ghost" className="bg-white text-neutral-900 dark:text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900 border-none rounded-full px-8 shadow-sm">
                SHOP NOW
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right Stacked Cards */}
        <div className="flex flex-col gap-4 h-[600px]">
          {/* Top Right Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`relative flex-1 rounded-3xl overflow-hidden ${topRight.color} flex items-center p-8 group cursor-pointer hover:shadow-card transition-all duration-500`}
          >
            <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl flex justify-end">
              <img 
                src={topRight.image} 
                alt={topRight.title} 
                className="w-1/2 h-full object-cover object-left mask-image-left-fade group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent sm:from-white/10 dark:from-black/40" />
            </div>

            <div className="relative z-10 w-1/2 group-hover:translate-x-2 transition-transform duration-500 ease-out">
              <h3 className="text-2xl font-heading font-bold text-white md:text-neutral-900 dark:text-white mb-2">{topRight.title}</h3>
              <p className="text-sm text-white/80 md:text-neutral-600 dark:text-neutral-400 mb-4">{topRight.subtitle}</p>
              <Link to={`/category/${topRight.slug}`}>
                <Button size="sm" variant="ghost" className="border-2 border-white md:border-neutral-900 dark:border-white text-white md:text-neutral-900 dark:text-neutral-900 hover:bg-white rounded-full px-6 bg-white backdrop-blur-md shadow-sm">
                  SHOP NOW
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Bottom Right Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`relative flex-1 rounded-3xl overflow-hidden ${bottomRight.color} flex items-center p-8 group cursor-pointer hover:shadow-card transition-all duration-500`}
          >
            <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl flex justify-end">
              <img 
                src={bottomRight.image} 
                alt={bottomRight.title} 
                className="w-1/2 h-full object-cover object-left mask-image-left-fade group-hover:scale-110 group-hover:-rotate-1 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent sm:from-white/10 dark:from-black/40" />
            </div>

            <div className="relative z-10 w-1/2 group-hover:translate-x-2 transition-transform duration-500 ease-out">
              <h3 className="text-2xl font-heading font-bold text-white md:text-neutral-900 dark:text-white mb-2">{bottomRight.title}</h3>
              <p className="text-sm text-white/80 md:text-neutral-600 dark:text-neutral-400 mb-4">{bottomRight.subtitle}</p>
              <Link to={`/category/${bottomRight.slug}`}>
                <Button size="sm" variant="ghost" className="border-2 border-white md:border-neutral-900 dark:border-white text-white md:text-neutral-900 dark:text-neutral-900 hover:bg-white rounded-full px-6 bg-white backdrop-blur-md shadow-sm">
                  SHOP NOW
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
