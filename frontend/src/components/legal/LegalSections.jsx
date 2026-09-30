import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { revealUp, IN_VIEW } from '@/animations/variants';

const MotionSection = motion.section;

// Shared building blocks for the legal pages. Each page passes its own
// `sections` list ({ id, title, icon }), so headings and the contents list
// always come from one source.

/** Numbered policy section; its heading comes from `sections` so the contents list always matches */
export function PolicySection({ sections, index, card = false, children }) {
  const { id, title, icon } = sections[index];
  const Icon = icon;

  return (
    <MotionSection
      id={id}
      aria-labelledby={`${id}-title`}
      variants={revealUp}
      initial="hidden"
      whileInView="show"
      viewport={IN_VIEW}
      className={
        card
          ? 'mt-10 scroll-mt-28 rounded-[2rem] border border-line bg-surface px-6 py-8 sm:mt-14 sm:px-10 sm:py-10'
          : 'scroll-mt-28 border-b border-line py-10 last:border-b-0 sm:py-14'
      }
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent" aria-hidden="true">
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-display text-sm tabular-nums text-ink-faint" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h2 id={`${id}-title`} className="mt-5 font-display text-[clamp(1.6rem,2.8vw,2.25rem)] font-medium leading-[1.08] tracking-[-0.03em] text-ink">
        {title}
      </h2>
      {children}
    </MotionSection>
  );
}

/** Tracks which section is currently being read */
function useActiveSection(sections) {
  const [active, setActive] = useState(sections[0].id);

  useEffect(() => {
    const elements = sections.map((section) => document.getElementById(section.id)).filter(Boolean);
    if (!elements.length || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -55% 0px' }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return active;
}

export function TableOfContents({ sections }) {
  const active = useActiveSection(sections);

  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-32">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">On this page</p>

      {/* Phones & tablets: wrapping chips */}
      <ul className="mt-4 flex flex-wrap gap-2 lg:hidden">
        {sections.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-ink-soft ring-1 ring-inset ring-line transition-colors duration-300 hover:bg-ink hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>

      {/* Desktop: sticky list with the current section marked */}
      <ol className="mt-5 hidden border-l border-line lg:block">
        {sections.map((item, i) => {
          const current = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? 'location' : undefined}
                className={`-ml-px flex min-h-11 items-center gap-3 border-l-2 py-2 pl-5 text-[15px] leading-snug transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  current ? 'border-accent text-ink' : 'border-transparent text-ink-faint hover:text-ink'
                }`}
              >
                <span className="font-display text-xs tabular-nums text-ink-faint" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {item.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
