import { motion, useReducedMotion } from 'framer-motion';
import { Target, Star, ShieldCheck, Check } from 'lucide-react';
import { revealClip, revealGroup, revealUp, IN_VIEW } from '@/animations/variants';
import PageHeader from '@/components/common/PageHeader';
import Accent from '@/components/home/ui/Accent';
import Eyebrow from '@/components/home/ui/Eyebrow';
import { CONTAINER } from '@/components/home/ui/styles';
import botanical640 from '@/assets/home/botanical-640.webp';
import botanical1280 from '@/assets/home/botanical-1280.webp';
import care800 from '@/assets/home/care-800.webp';

const MotionDiv = motion.div;
const MotionUl = motion.ul;
const MotionLi = motion.li;

const H2 = 'font-display text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.035em]';
const STRONG = 'font-medium text-ink';

const OFFERINGS = [
  'Single remedies',
  'Mother tinctures (Q)',
  'Dilutions (CH, X, LM potencies)',
  'Biochemic medicines',
  'Combination formulas',
  'Specialized wellness products',
];

const BRANDS = ['SBL', 'Dr. Reckeweg', 'Adel', 'Bakson', 'Schwabe', 'Nipco', 'New Life', 'REPL', 'Adven'];

const REASONS = [
  'Wide range of homeopathic medicines',
  '100% genuine and authentic products',
  'Competitive pricing',
  'Easy online ordering',
  'Fast and secure delivery across India',
  'Customer-focused support',
];

/** Fades a block up once it scrolls into view */
function Reveal({ className, children }) {
  return (
    <MotionDiv variants={revealUp} initial="hidden" whileInView="show" viewport={IN_VIEW} className={className}>
      {children}
    </MotionDiv>
  );
}

/** Rounded photo uncovered by a clip wipe; the observed wrapper stays unclipped */
function ClipPhoto({ className, frameClassName = '', children }) {
  const reduceMotion = useReducedMotion();
  return (
    <MotionDiv initial={reduceMotion ? 'show' : 'hidden'} whileInView="show" viewport={IN_VIEW} className={`relative ${className}`}>
      <MotionDiv variants={revealClip} className={`absolute inset-0 overflow-hidden bg-mist ${frameClassName}`}>
        {children}
      </MotionDiv>
    </MotionDiv>
  );
}

export default function AboutUs() {
  return (
    <div className="bg-canvas pb-24 sm:pb-32">
      <PageHeader
        eyebrow="About 1SkyStore"
        title="About Us"
        intro={
          <>
            Welcome to <strong className={STRONG}>1SkyStore</strong>, your trusted online destination to buy homeopathic medicines in India. We are committed to making natural, safe, and effective healing accessible to every household across the country with fast and reliable delivery.
          </>
        }
      />

      {/* Who We Are */}
      <section aria-labelledby="about-who" className={`${CONTAINER} mt-6 grid grid-cols-1 items-center gap-12 sm:mt-10 lg:grid-cols-12 lg:gap-10`}>
        <ClipPhoto className="aspect-[4/5] w-full sm:w-4/5 lg:col-span-5 lg:w-full" frameClassName="rounded-[2rem]">
          <img
            src={botanical1280}
            srcSet={`${botanical640} 640w, ${botanical1280} 1280w`}
            sizes="(min-width: 1024px) 36vw, (min-width: 640px) 80vw, 100vw"
            alt="Glass tincture bottles, fresh leaves and a wooden spoon of citrus on a pale wooden table"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </ClipPhoto>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <Eyebrow index="01">Our story</Eyebrow>
            <h2 id="about-who" className={`${H2} mt-5 text-ink`}>
              Who We Are
            </h2>
            <p className="mt-7 text-[17px] leading-relaxed text-ink-soft">
              1SkyStore is a dedicated <strong className={STRONG}>e-commerce platform for homeopathy medicines</strong>, offering a wide selection of authentic remedies sourced from India’s and the world’s most trusted brands. Our goal is to simplify the process of purchasing homeopathic medicines online while ensuring quality, affordability, and convenience.
            </p>
          </Reveal>
          <Reveal>
            <blockquote className="mt-10 border-l-2 border-accent pl-6 font-serif text-[clamp(1.4rem,2.4vw,1.9rem)] italic leading-[1.3] text-ink">
              <p>
                Whether you are a long-time believer in homeopathy or just beginning your journey towards natural healing, 1SkyStore is here to support your wellness needs.
              </p>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* Mission & Vision */}
      <MotionDiv
        variants={revealGroup(0.12)}
        initial="hidden"
        whileInView="show"
        viewport={IN_VIEW}
        className={`${CONTAINER} mt-24 grid grid-cols-1 gap-5 sm:mt-32 md:grid-cols-2`}
      >
        <MotionDiv variants={revealUp} className="flex flex-col rounded-[2rem] bg-tint-4 p-8 sm:p-12">
          <section aria-labelledby="about-mission">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface/70 text-accent" aria-hidden="true">
              <Target className="h-5 w-5" />
            </span>
            <h2 id="about-mission" className="mt-10 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.035em] text-ink">
              Our Mission
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-[17px]">
              Our mission is to provide <strong className={STRONG}>genuine homeopathic medicines online across India</strong> while promoting holistic healing and wellness. We aim to bridge the gap between traditional homeopathy and modern e-commerce by delivering trusted remedies right to your doorstep.
            </p>
          </section>
        </MotionDiv>

        <MotionDiv variants={revealUp} className="flex flex-col rounded-[2rem] bg-tint-1 p-8 sm:p-12">
          <section aria-labelledby="about-vision">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface/70 text-accent" aria-hidden="true">
              <Star className="h-5 w-5" />
            </span>
            <h2 id="about-vision" className="mt-10 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.035em] text-ink">
              Our Vision
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-[17px]">
              We envision becoming India’s most trusted online platform for homeopathy by delivering reliable products, spreading awareness about natural healing, and building long-term relationships with our customers.
            </p>
          </section>
        </MotionDiv>
      </MotionDiv>

      {/* What We Offer */}
      <section aria-labelledby="about-offer" className={`${CONTAINER} mt-24 grid grid-cols-1 gap-12 sm:mt-32 lg:grid-cols-12 lg:gap-10`}>
        <div className="lg:col-span-6">
          <Reveal>
            <Eyebrow index="02">The range</Eyebrow>
            <h2 id="about-offer" className={`${H2} mt-5 text-ink`}>
              What We Offer
            </h2>
            <p className="mt-7 text-[17px] leading-relaxed text-ink-soft">
              At 1SkyStore, you can explore a comprehensive range of homeopathic products, including:
            </p>
          </Reveal>

          <MotionUl
            variants={revealGroup(0.06)}
            initial="hidden"
            whileInView="show"
            viewport={IN_VIEW}
            className="mt-8 divide-y divide-line border-y border-line"
          >
            {OFFERINGS.map((item, i) => (
              <MotionLi key={item} variants={revealUp} className="flex items-baseline gap-5 py-4">
                <span className="w-6 shrink-0 font-display text-sm tabular-nums text-ink-faint" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-lg font-medium tracking-[-0.015em] text-ink sm:text-xl">{item}</span>
              </MotionLi>
            ))}
          </MotionUl>

          <Reveal>
            <p className="mt-8 text-[17px] leading-relaxed text-ink-soft">
              We cater to a wide range of health concerns such as immunity, hair fall, skin care, digestion, stress, and overall well-being.
            </p>
          </Reveal>
        </div>

        <ClipPhoto className="aspect-[3/2] w-full lg:sticky lg:top-32 lg:col-span-5 lg:col-start-8 lg:self-start" frameClassName="rounded-[2rem]">
          <img
            src={care800}
            alt="An open hand holding a single tablet beside a glass of water"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-[35%_60%]"
          />
        </ClipPhoto>
      </section>

      {/* Trusted Brands */}
      <section aria-labelledby="about-brands" className={`${CONTAINER} mt-24 sm:mt-32`}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5">
            <Eyebrow index="03">Our partners</Eyebrow>
            <h2 id="about-brands" className={`${H2} mt-5 text-ink`}>
              Trusted Brands We Deal In
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-6 lg:col-start-7 lg:self-end">
            <p className="text-[17px] leading-relaxed text-ink-soft">
              We proudly offer products from some of the most renowned homeopathy brands, ensuring authenticity and quality:
            </p>
          </Reveal>
        </div>

        <MotionUl
          variants={revealGroup(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-12 grid grid-cols-2 border-l border-t border-line sm:grid-cols-3"
        >
          {BRANDS.map((brand) => (
            <MotionLi
              key={brand}
              variants={revealUp}
              className="flex min-h-24 items-center border-b border-r border-line px-5 py-6 font-display text-[clamp(1.15rem,2.2vw,1.75rem)] font-medium tracking-[-0.03em] text-ink transition-colors duration-500 hover:bg-surface sm:min-h-32 sm:px-8"
            >
              {brand}
            </MotionLi>
          ))}
        </MotionUl>

        <Reveal>
          <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            Our strong network with reliable suppliers ensures that every product you receive is <strong className={STRONG}>100% genuine and properly stored</strong>.
          </p>
        </Reveal>
      </section>

      {/* Why Choose Us */}
      <section aria-labelledby="about-why" className="mt-24 px-3 sm:mt-32 sm:px-5">
        <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-deep px-6 py-16 sm:rounded-[2.5rem] sm:px-12 sm:py-20 lg:px-16 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <Reveal>
                <Eyebrow index="04" tone="deep">Why us</Eyebrow>
                <h2 id="about-why" className={`${H2} mt-5 text-on-deep`}>
                  Why Choose <Accent tone="deep">1SkyStore?</Accent>
                </h2>
              </Reveal>

              <MotionUl
                variants={revealGroup(0.06)}
                initial="hidden"
                whileInView="show"
                viewport={IN_VIEW}
                className="mt-10 grid grid-cols-1 border-t border-on-deep/10 sm:grid-cols-2 sm:gap-x-8"
              >
                {REASONS.map((reason) => (
                  <MotionLi key={reason} variants={revealUp} className="flex items-start gap-3 border-b border-on-deep/10 py-4 text-on-deep">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-on-deep/10 text-[#9EC3ED]" aria-hidden="true">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[15px] leading-relaxed sm:text-base">{reason}</span>
                  </MotionLi>
                ))}
              </MotionUl>

              <Reveal>
                <p className="mt-8 max-w-xl text-base leading-relaxed text-on-deep-soft sm:text-[17px]">
                  We prioritize your health and satisfaction, making us a preferred choice for <strong className="font-medium text-on-deep">buying homeopathic medicines online in India</strong>.
                </p>
              </Reveal>
            </div>

            <Reveal className="lg:col-span-4 lg:col-start-9 lg:self-end">
              <div className="rounded-[1.75rem] bg-on-deep/5 p-8 ring-1 ring-inset ring-on-deep/10 sm:p-10">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-on-deep/10 text-[#9EC3ED]" aria-hidden="true">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h3 className="mt-8 font-display text-2xl font-medium tracking-[-0.03em] text-on-deep">Quality & Trust</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-on-deep-soft">
                  At 1SkyStore, quality is our top priority. Every product listed on our website is carefully sourced and handled to maintain its effectiveness. We follow strict quality checks to ensure that you receive only the best.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Outro */}
      <section aria-labelledby="about-outro" className={`${CONTAINER} mt-24 sm:mt-32`}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow>Our promise</Eyebrow>
          <h2 id="about-outro" className={`${H2} mt-5 text-ink`}>
            Shop With <Accent>Confidence</Accent>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            With 1SkyStore, you can shop for your homeopathic needs with confidence. We are here to make your journey toward natural healing simple, accessible, and effective.
          </p>
          <p className="mx-auto mt-10 max-w-2xl border-t border-line pt-10 font-serif text-[clamp(1.35rem,2.4vw,1.85rem)] italic leading-[1.3] text-accent">
            1SkyStore – Buy Homeopathic Medicines Online in India with Trust & Confidence
          </p>
        </Reveal>
      </section>
    </div>
  );
}
