import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import productService from '@/api/product.service';
import { fetchWithCache } from '@/utils/apiCache';
import { staggerContainer, staggerItem } from '@/animations/variants';

export default function SymptomSection({ bgClass = "bg-neutral-50/50 dark:bg-neutral-900/30" }) {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('view-all'); // 'view-all' or 'slider'
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchWithCache('symptoms', () => productService.getSymptoms())
      .then(res => {
        const d = res.data?.data || res.data;
        const fetchedSymptoms = Array.isArray(d) ? d : d?.symptoms || [];
        const validSymptoms = fetchedSymptoms.filter(s => {
          if (!s) return false;
          if (typeof s === 'string') return s.trim() !== '';
          if (s.name) return s.name.trim() !== '';
          return false;
        });
        setSymptoms(validSymptoms);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && symptoms.length === 0) return null;

  const displaySymptoms = showAll ? symptoms : symptoms.slice(0, 15);

  return (
    <section className={`py-16 sm:py-20 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-neutral-900 dark:text-neutral-50">
            Browse by Symptoms
          </h2>
          
          {/* Toggle View all / Slider */}
          <div className="hidden sm:inline-flex items-center p-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-sm">
            <button
              onClick={() => setMode('view-all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                mode === 'view-all' 
                ? 'bg-primary-800 text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 bg-transparent'
              }`}
            >
              View all
            </button>
            <button
              onClick={() => setMode('slider')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                mode === 'slider' 
                ? 'bg-primary-800 text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 bg-transparent'
              }`}
            >
              Slider
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-wrap gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-shimmer h-10 w-32 rounded-full" />
            ))}
          </div>
        ) : (
          <>
            <div className={`relative hidden ${mode === 'view-all' ? 'sm:block' : 'sm:hidden'}`}>
              <motion.div 
                key={displaySymptoms.length}
                className="flex flex-wrap gap-3"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {displaySymptoms.map((symptom, i) => (
                  <motion.div key={i} variants={staggerItem}>
                    <SymptomChip symptom={symptom} />
                  </motion.div>
                ))}
              </motion.div>
              
              {symptoms.length > 15 && (
                <div className="mt-8 flex justify-center w-full">
                  <button 
                    onClick={() => setShowAll(!showAll)}
                    className="px-6 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-sm font-semibold text-neutral-700 dark:text-neutral-300 shadow-sm hover:border-primary-300 transition-colors"
                  >
                    {showAll ? 'Less' : 'More'}
                  </button>
                </div>
              )}
            </div>

            {/* Slider Mode */}
            <div className={`overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 block ${mode === 'slider' ? 'sm:block' : 'sm:hidden'}`}>
               <motion.div 
                className="flex gap-3 min-w-max"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {symptoms.map((symptom, i) => (
                  <motion.div key={i} variants={staggerItem}>
                    <SymptomChip symptom={symptom} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function SymptomChip({ symptom }) {
  const name = typeof symptom === 'string' ? symptom : symptom.name;
  return (
    <Link 
      to={`/shop?symptom=${encodeURIComponent(name)}`}
      className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#eaf1fa] dark:bg-primary-900/20 border border-[#d3e1f2] dark:border-primary-800/50 text-[13px] font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-primary-500 hover:border-primary-500 hover:text-white hover:shadow-glow hover:-translate-y-0.5 dark:hover:bg-primary-600 dark:hover:border-primary-600 transition-all duration-200 shadow-sm"
    >
      {name}
    </Link>
  );
}
