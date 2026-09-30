import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { revealClip, revealGroup, revealUp, IN_VIEW } from '@/animations/variants';
import { useBlogs } from '@/hooks/useStoreData';
import SectionHeading from './ui/SectionHeading';
import Accent from './ui/Accent';
import { TextLink } from './ui/PillLink';
import StatusMessage from './ui/StatusMessage';
import { CONTAINER, SECTION_Y } from './ui/styles';

const MotionDiv = motion.div;
const MotionOl = motion.ol;
const MotionLi = motion.li;

const blogPath = (post) => `/blog/${post.slug || post.id}`;

function formatDate(post) {
  const raw = post.published_at || post.created_at || post.createdAt;
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return {
    iso: date.toISOString(),
    label: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  };
}

const topicOf = (post) => (Array.isArray(post.tags) && post.tags[0]) || post.category || 'Wellness';

export default function WellnessJournal() {
  const { data, loading, error, retry } = useBlogs();
  const posts = (data || []).slice(0, 4);

  if (!loading && !error && !posts.length) return null;

  const [lead, ...others] = posts;

  return (
    <section aria-labelledby="journal-title" className={`bg-canvas ${SECTION_Y}`}>
      <div className={CONTAINER}>
        <SectionHeading
          id="journal-title"
          eyebrow="The journal"
          index="07"
          lines={['Your guide to', <>everyday <Accent key="w">wellness.</Accent></>]}
        >
          <TextLink to="/blog">All articles</TextLink>
        </SectionHeading>

        <div className="mt-14 lg:mt-20">
          {loading ? (
            <div className="grid gap-10 lg:grid-cols-12" aria-label="Loading articles">
              <div className="skeleton-shimmer aspect-[4/3] rounded-[2rem] lg:col-span-7" />
              <div className="space-y-6 lg:col-span-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton-shimmer h-28 rounded-2xl" />
                ))}
              </div>
            </div>
          ) : error ? (
            <StatusMessage title="We couldn't load the journal" text="Please check your connection." onRetry={retry} />
          ) : (
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
              <LeadArticle post={lead} />

              {others.length > 0 && (
                <MotionOl
                  variants={revealGroup(0.1, 0.15)}
                  initial="hidden"
                  whileInView="show"
                  viewport={IN_VIEW}
                  className="divide-y divide-line border-y border-line lg:col-span-5 lg:self-start"
                >
                  {others.map((post, i) => (
                    <MotionLi key={post.id} variants={revealUp}>
                      <ArticleRow post={post} index={i + 2} />
                    </MotionLi>
                  ))}
                </MotionOl>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LeadArticle({ post }) {
  const date = formatDate(post);
  // Clip-path wipes aren't transforms, so MotionConfig won't skip them for us
  const reduceMotion = useReducedMotion();

  return (
    <article className="group relative lg:col-span-7">
      {/* Observed wrapper stays unclipped so IntersectionObserver can see it */}
      <MotionDiv initial={reduceMotion ? 'show' : 'hidden'} whileInView="show" viewport={IN_VIEW} className="relative aspect-[4/3]">
      <MotionDiv variants={revealClip} className="absolute inset-0 overflow-hidden rounded-[2rem] bg-mist">
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        )}
        <span className="absolute left-5 top-5 rounded-full bg-surface/85 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink backdrop-blur">
          {topicOf(post)}
        </span>
      </MotionDiv>
      </MotionDiv>

      <MotionDiv variants={revealUp} initial="hidden" whileInView="show" viewport={IN_VIEW} className="mt-7 max-w-2xl">
        {date && (
          <time dateTime={date.iso} className="text-[13px] text-ink-faint">
            {date.label}
          </time>
        )}
        <h3 className="mt-2 font-display text-[clamp(1.6rem,2.8vw,2.5rem)] font-medium leading-[1.06] tracking-[-0.035em] text-ink">
          <Link
            to={blogPath(post)}
            className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat transition-[background-size] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] before:absolute before:inset-0 before:content-[''] group-hover:bg-[length:100%_1.5px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-4 line-clamp-3 text-base leading-relaxed text-ink-soft">{post.excerpt}</p>}
        <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink" aria-hidden="true">
          Read article
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </p>
      </MotionDiv>
    </article>
  );
}

function ArticleRow({ post, index }) {
  const date = formatDate(post);

  return (
    <article className="group relative flex items-center gap-5 py-6">
      <span className="self-start pt-1 font-display text-sm tabular-nums text-ink-faint">
        {String(index).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">{topicOf(post)}</p>
        <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-medium leading-snug tracking-[-0.02em] text-ink">
          <Link
            to={blogPath(post)}
            className="before:absolute before:inset-0 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {post.title}
          </Link>
        </h3>
        {date && (
          <time dateTime={date.iso} className="mt-1.5 block text-[13px] text-ink-faint">
            {date.label}
          </time>
        )}
      </div>
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-mist sm:h-28 sm:w-28">
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true">
          <ArrowUpRight className="h-5 w-5 text-white" />
        </span>
      </div>
    </article>
  );
}
