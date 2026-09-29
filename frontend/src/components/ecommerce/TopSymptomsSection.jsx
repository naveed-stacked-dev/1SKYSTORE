import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/animations/variants';

import acidityImg from '@/assets/symptoms/Acidity&Indigestion.jpg';
import anxietyImg from '@/assets/symptoms/Anxiety.jpeg';
import hairfallImg from '@/assets/symptoms/Hairfall.png';
import jointPainImg from '@/assets/symptoms/Joint-pain-and-Arthritis.webp';
import kidneyStonesImg from '@/assets/symptoms/Kidney-Stones.webp';
import menstrualProblemsImg from '@/assets/symptoms/Menstrual-Problems.webp';
import migrainesImg from '@/assets/symptoms/Migraines.jpg';
import pilesImg from '@/assets/symptoms/Piles.webp';
import sinusitisImg from '@/assets/symptoms/Sinusitis.webp';
import skinConditionsImg from '@/assets/symptoms/Skin-conditions.webp';

const TOP_SYMPTOMS = [
  { name: 'Sinusitis', image: sinusitisImg, query: 'Sinusitis & Blocked Nose' },
  { name: 'Kidney Stones', image: kidneyStonesImg, query: 'Kidney Stone' },
  { name: 'Piles', image: pilesImg, query: 'Piles & Fissures' },
  { name: 'Migraines', image: migrainesImg, query: 'Headache & Migraine' },
  { name: 'Acidity & Indigestion', image: acidityImg, query: 'Acidity' },
  { name: 'Joint pain and Arthritis', image: jointPainImg, query: 'Joint issues' },
  { name: 'Skin conditions', image: skinConditionsImg, query: 'Psoriasis & Dry Skin' },
  { name: 'Anxiety', image: anxietyImg, query: 'Anxiety & Depression' },
  { name: 'Menstrual Problems', image: menstrualProblemsImg, query: 'Menstrual Cramps' },
  { name: 'Hairfall', image: hairfallImg, query: 'Hair Fall' },
];

export default function TopSymptomsSection() {
  return (
    <section className="py-16 sm:py-24 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-neutral-100 dark:border-neutral-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary-600 ring-1 ring-inset ring-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-800/60"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500 dark:bg-primary-400" />
            Shop by concern
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 dark:text-neutral-50"
          >
            Top Symptoms
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: 60 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-primary-500 to-secondary-400 mx-auto mt-4 rounded-full"
          />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto text-lg"
          >
            Find curated natural solutions for the most common health challenges.
          </motion.p>
        </div>

        <motion.div 
          className="flex overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 no-scrollbar"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {TOP_SYMPTOMS.map((symptom) => (
            <motion.div 
              key={symptom.name} 
              variants={staggerItem}
              className="w-[200px] flex-shrink-0 snap-center sm:w-auto sm:flex-shrink-1"
            >
              <Link 
                to={`/shop?symptom=${encodeURIComponent(symptom.query || symptom.name)}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[2rem] bg-white dark:bg-neutral-900 shadow-soft transition-all hover:shadow-premium hover:-translate-y-2 border border-neutral-100 dark:border-neutral-800"
              >
                <div className="absolute inset-0 z-0">
                  <img 
                    src={symptom.image} 
                    alt={symptom.name} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-center">
                  <h3 className="text-sm font-bold text-white sm:text-base tracking-tight">
                    {symptom.name}
                  </h3>
                  <div className="mt-2 h-0.5 w-0 bg-gradient-to-r from-primary-400 to-secondary-300 mx-auto rounded-full transition-all duration-300 group-hover:w-10" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
