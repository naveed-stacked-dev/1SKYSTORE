import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { EASE_OUT, revealClip, revealGroup, revealUp, IN_VIEW } from '@/animations/variants';
import { useBrands, useCatalogSize, useCategories } from '@/hooks/useStoreData';
import SectionHeading from './ui/SectionHeading';
import Accent from './ui/Accent';
import { TextLink } from './ui/PillLink';
import { CONTAINER, SECTION_Y } from './ui/styles';
import botanical640 from '@/assets/home/botanical-640.webp';
import botanical1280 from '@/assets/home/botanical-1280.webp';
import care800 from '@/assets/home/care-800.webp';

const MotionDiv = motion.div;
const MotionSpan = motion.span;
const MotionImg = motion.img;
const MotionDl = motion.dl;

const MANIFESTO =
  'We believe everyday care should feel simple, honest and calm. So every remedy here comes from established homeopathic brands — clearly described, carefully packed and delivered to your door.';

export default function BrandStory() {
  const section = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] });

  const depth = reduceMotion ? 0 : 1;
  const photoY = useTransform(scrollYProgress, [0, 1], [-60 * depth, 60 * depth]);
  const insetY = useTransform(scrollYProgress, [0, 1], [90 * depth, -90 * depth]);
  // The page warms slightly as the story comes into focus
  const wash = useTransform(scrollYProgress, [0.1, 0.4, 0.75, 0.95], [0, 1, 1, 0]);

  return (
    <section ref={section} aria-labelledby="story-title" className={`relative overflow-hidden bg-canvas ${SECTION_Y}`}>
      <MotionDiv style={{ opacity: wash }} className="absolute inset-0 bg-mist" aria-hidden="true" />

      <div className={`${CONTAINER} relative grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-10`}>
        <div className="lg:col-span-6">
          <SectionHeading
            id="story-title"
            eyebrow="Our philosophy"
            index="04"
            lines={['Healthcare,', <Accent key="r">reimagined.</Accent>]}
          />

          <Manifesto text={MANIFESTO} />

          <Stats />

          <div className="mt-10">
            <TextLink to="/about">Read our story</TextLink>
          </div>
        </div>

        {/* Layered photography */}
        <div className="relative lg:col-span-5 lg:col-start-8">
          {/* The observed wrapper stays unclipped: IntersectionObserver sees
              nothing of an element whose own clip-path hides it */}
          <MotionDiv
            initial={reduceMotion ? 'show' : 'hidden'}
            whileInView="show"
            viewport={IN_VIEW}
            className="relative ml-auto aspect-[3/4] w-[88%] sm:w-[80%] lg:w-full"
          >
            <MotionDiv variants={revealClip} className="absolute inset-0 overflow-hidden rounded-[2.25rem] bg-mist">
            <MotionImg
              style={{ y: photoY }}
              src={botanical1280}
              srcSet={`${botanical640} 640w, ${botanical1280} 1280w`}
              sizes="(min-width: 1024px) 38vw, 80vw"
              alt="Glass tincture bottles, fresh leaves and a wooden spoon of citrus on a pale wooden table"
              loading="lazy"
              decoding="async"
              className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover"
            />
            </MotionDiv>
          </MotionDiv>

          <MotionDiv
            style={{ y: insetY }}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={IN_VIEW}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE_OUT }}
            className="absolute -bottom-8 left-0 aspect-square w-[42%] overflow-hidden rounded-full ring-[10px] ring-canvas sm:w-[38%] lg:-left-14 lg:w-[44%]"
          >
            <img
              src={care800}
              alt="An open hand holding a single tablet beside a glass of water"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-[35%_60%]"
            />
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}

/** Paragraph whose words brighten as it scrolls through the viewport */
function Manifesto({ text }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] });
  const words = text.split(' ');

  return (
    <p
      ref={ref}
      className="mt-10 max-w-[36rem] font-display text-[clamp(1.35rem,2.1vw,1.85rem)] font-normal leading-[1.35] tracking-[-0.02em] text-ink"
    >
      {words.map((word, i) => (
        <Word
          key={i}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          still={reduceMotion}
        >
          {word}
        </Word>
      ))}
    </p>
  );
}

function Word({ progress, range, still, children }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <MotionSpan style={still ? undefined : { opacity }} className="inline">
      {children}{' '}
    </MotionSpan>
  );
}

/** Live catalogue numbers — each shown only once the API has answered */
function Stats() {
  const brands = useBrands();
  const categories = useCategories();
  const catalog = useCatalogSize();

  const stats = [
    { value: catalog.data, label: 'Remedies & essentials' },
    { value: brands.data?.length, label: 'Trusted brands' },
    { value: categories.data?.length, label: 'Categories' },
  ].filter((s) => Number(s.value) > 0);

  if (!stats.length) return null;

  return (
    <MotionDl
      variants={revealGroup(0.1)}
      initial="hidden"
      whileInView="show"
      viewport={IN_VIEW}
      className="mt-12 grid max-w-[36rem] grid-cols-3 border-t border-line pt-8"
    >
      {stats.map((s) => (
        <MotionDiv key={s.label} variants={revealUp} className="flex flex-col-reverse gap-1.5 pr-4">
          <dt className="text-[12px] leading-snug text-ink-faint sm:text-[13px]">{s.label}</dt>
          <dd className="font-display text-[clamp(1.9rem,3.4vw,3rem)] font-medium leading-none tracking-[-0.04em] text-ink">
            <span className="sr-only">{Number(s.value).toLocaleString()}</span>
            <CountUp to={Number(s.value)} />
          </dd>
        </MotionDiv>
      ))}
    </MotionDl>
  );
}

function CountUp({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const value = useMotionValue(0);
  const rounded = useTransform(value, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (!inView) return undefined;
    if (reduceMotion) {
      value.set(to);
      return undefined;
    }
    const controls = animate(value, to, { duration: 1.8, ease: EASE_OUT });
    return () => controls.stop();
  }, [inView, reduceMotion, to, value]);

  return (
    <MotionSpan ref={ref} className="tabular-nums" aria-hidden="true">
      {rounded}
    </MotionSpan>
  );
}
