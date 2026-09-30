import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import blogService from '@/api/blog.service';
import Pagination from '@/components/ui/Pagination';
import PageHeader from '@/components/common/PageHeader';
import StatusMessage from '@/components/home/ui/StatusMessage';
import { CONTAINER } from '@/components/home/ui/styles';
import { revealClip, revealGroup, revealUp, IN_VIEW } from '@/animations/variants';

const MotionDiv = motion.div;
const MotionUl = motion.ul;
const MotionLi = motion.li;

const blogPath = (blog) => `/blog/${blog.slug || blog.id}`;

const topicOf = (blog) => blog.category || (Array.isArray(blog.tags) && blog.tags[0]) || null;

function formatDate(blog) {
  const raw = blog.createdAt || blog.created_at || blog.published_at;
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return {
    iso: date.toISOString(),
    label: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  };
}

// Underline that draws in under a title when its card is hovered
const TITLE_LINK =
  "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat transition-[background-size] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[length:100%_1.5px] before:absolute before:inset-0 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    document.title = 'Blog — 1SkyStore';
    loadBlogs();
  }, [page]);

  async function loadBlogs() {
    try {
      setLoading(true);
      const res = await blogService.getBlogs({ page, pageSize: 9 });
      const data = res.data?.data || res.data;
      setBlogs(Array.isArray(data) ? data : data?.blogs || data?.rows || []);
      setTotalPages(res.data?.pagination?.totalPages || data?.totalPages || data?.total_pages || Math.ceil((data?.count || 0) / 9) || 1);
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(newPage) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  }

  // The first story leads page one as a feature; later pages are a plain grid
  const hasLead = page === 1 && blogs.length > 0;
  const lead = hasLead ? blogs[0] : null;
  const rest = hasLead ? blogs.slice(1) : blogs;

  return (
    <div className="bg-canvas pb-24 sm:pb-32">
      <PageHeader
        eyebrow="The journal"
        title="Blog"
        intro="Insights on homeopathy, wellness, and natural health"
      />

      <div className={CONTAINER}>
        {loading ? (
          <BlogListSkeleton />
        ) : blogs.length === 0 ? (
          <div className="flex min-h-[40vh] items-center">
            <StatusMessage title="No blog posts yet" className="w-full" />
          </div>
        ) : (
          <>
            {lead && <LeadStory blog={lead} />}

            {rest.length > 0 && (
              <MotionUl
                key={page}
                variants={revealGroup(0.08)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.05 }}
                className={`grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 ${
                  lead ? 'mt-16 border-t border-line pt-14 sm:mt-20 sm:pt-16' : ''
                }`}
              >
                {rest.map((blog) => (
                  <MotionLi key={blog.id} variants={revealUp}>
                    <StoryCard blog={blog} />
                  </MotionLi>
                ))}
              </MotionUl>
            )}

            <div className="mt-4 sm:mt-8">
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TopicAndDate({ blog, className = '' }) {
  const topic = topicOf(blog);
  const date = formatDate(blog);
  if (!topic && !date) return null;

  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-faint ${className}`}>
      {topic && <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">{topic}</span>}
      {topic && date && <span className="h-1 w-1 rounded-full bg-line" aria-hidden="true" />}
      {date && <time dateTime={date.iso}>{date.label}</time>}
    </p>
  );
}

function LeadStory({ blog }) {
  const reduceMotion = useReducedMotion();
  const excerpt = blog.excerpt || blog.description;

  return (
    <article className="group relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
      {/* Observed wrapper stays unclipped so IntersectionObserver can see it */}
      <MotionDiv
        initial={reduceMotion ? 'show' : 'hidden'}
        animate="show"
        className="relative aspect-[4/3] lg:col-span-7"
      >
        <MotionDiv variants={revealClip} className="absolute inset-0 overflow-hidden rounded-[2rem] bg-mist">
          {blog.cover_image_url && (
            <img
              src={blog.cover_image_url}
              alt=""
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
          )}
        </MotionDiv>
      </MotionDiv>

      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="lg:col-span-5"
      >
        <TopicAndDate blog={blog} />
        <h2 className="mt-4 font-display text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.035em] text-ink">
          <Link to={blogPath(blog)} className={TITLE_LINK}>
            {blog.title}
          </Link>
        </h2>
        {excerpt && <p className="mt-5 line-clamp-4 text-base leading-relaxed text-ink-soft sm:text-[17px]">{excerpt}</p>}
        <p className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-ink" aria-hidden="true">
          Read more
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </p>
      </MotionDiv>
    </article>
  );
}

function StoryCard({ blog }) {
  const excerpt = blog.excerpt || blog.description;

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-mist">
        {blog.cover_image_url && (
          <img
            src={blog.cover_image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
        )}
        <span
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          aria-hidden="true"
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <TopicAndDate blog={blog} className="mt-6" />
      <h2 className="mt-3 line-clamp-3 font-display text-[1.35rem] font-medium leading-[1.2] tracking-[-0.025em] text-ink">
        <Link to={blogPath(blog)} className={TITLE_LINK}>
          {blog.title}
        </Link>
      </h2>
      {excerpt && <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-ink-soft">{excerpt}</p>}
    </article>
  );
}

function BlogListSkeleton() {
  return (
    <div aria-label="Loading articles" aria-busy="true">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="skeleton-shimmer aspect-[4/3] rounded-[2rem] lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <div className="skeleton-shimmer h-3 w-40 rounded-full" />
          <div className="skeleton-shimmer h-9 w-11/12 rounded-full" />
          <div className="skeleton-shimmer h-9 w-2/3 rounded-full" />
          <div className="skeleton-shimmer mt-6 h-4 w-full rounded-full" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded-full" />
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 border-t border-line pt-14 sm:mt-20 sm:grid-cols-2 sm:pt-16 lg:grid-cols-3 lg:gap-x-10">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="skeleton-shimmer aspect-[4/3] rounded-[1.75rem]" />
            <div className="skeleton-shimmer mt-6 h-3 w-32 rounded-full" />
            <div className="skeleton-shimmer mt-4 h-5 w-11/12 rounded-full" />
            <div className="skeleton-shimmer mt-2 h-5 w-2/3 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
