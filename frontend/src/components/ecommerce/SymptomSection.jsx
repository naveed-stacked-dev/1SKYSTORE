import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import productService from '@/api/product.service';
import { fetchWithCache } from '@/utils/apiCache';
import { revealGroup, revealUp } from '@/animations/variants';
import Eyebrow from '@/components/home/ui/Eyebrow';
import { CONTAINER } from '@/components/home/ui/styles';
import { cn } from '@/utils/cn';

const MotionDiv = motion.div;
const MotionSpan = motion.span;

const MODES = [
  { id: 'view-all', label: 'View all' },
  { id: 'slider', label: 'Slider' },
];

export default function SymptomSection({ bgClass = 'bg-canvas' }) {
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
    <section className={cn('py-16 sm:py-24', bgClass)}>
      <div className={CONTAINER}>

        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Shop by concern</Eyebrow>
            <h2 className="font-display mt-4 text-[clamp(1.75rem,3.4vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ink">
              Browse by Symptoms
            </h2>
          </div>

          {/* Toggle View all / Slider */}
          <div role="group" aria-label="Symptom layout" className="hidden shrink-0 items-center rounded-full p-1 ring-1 ring-inset ring-line sm:inline-flex">
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    'relative min-h-10 rounded-full px-5 text-sm font-medium transition-colors duration-300',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                    active ? 'text-canvas' : 'text-ink-soft hover:text-ink'
                  )}
                >
                  {active && (
                    <MotionSpan
                      layoutId="symptom-mode-pill"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    />
                  )}
                  <span className="relative">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-wrap gap-3" aria-label="Loading symptoms">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-shimmer h-11 w-32 rounded-full" />
            ))}
          </div>
        ) : (
          <>
            <div className={`relative hidden ${mode === 'view-all' ? 'sm:block' : 'sm:hidden'}`}>
              <MotionDiv
                key={displaySymptoms.length}
                className="flex flex-wrap gap-2.5"
                variants={revealGroup(0.025)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {displaySymptoms.map((symptom, i) => (
                  <MotionDiv key={i} variants={revealUp}>
                    <SymptomChip symptom={symptom} />
                  </MotionDiv>
                ))}
              </MotionDiv>

              {symptoms.length > 15 && (
                <div className="mt-10 flex w-full justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAll(!showAll)}
                    aria-expanded={showAll}
                    className="inline-flex min-h-11 items-center rounded-full px-6 text-sm font-medium text-ink ring-1 ring-inset ring-line transition-colors duration-300 hover:bg-ink hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {showAll ? 'Less' : 'More'}
                  </button>
                </div>
              )}
            </div>

            {/* Slider Mode */}
            <div className={`-mx-4 block overflow-x-auto px-4 pb-4 no-scrollbar sm:mx-0 sm:px-0 ${mode === 'slider' ? 'sm:block' : 'sm:hidden'}`}>
              <MotionDiv
                className="flex min-w-max gap-2.5"
                variants={revealGroup(0.025)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {symptoms.map((symptom, i) => (
                  <MotionDiv key={i} variants={revealUp}>
                    <SymptomChip symptom={symptom} />
                  </MotionDiv>
                ))}
              </MotionDiv>
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
      className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full bg-surface px-5 text-sm font-medium text-ink ring-1 ring-inset ring-line transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:text-canvas hover:ring-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {name}
    </Link>
  );
}
