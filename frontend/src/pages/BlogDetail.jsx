import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import blogService from '@/api/blog.service';
import { Skeleton } from '@/components/ui/Skeleton';
import StatusMessage from '@/components/home/ui/StatusMessage';
import { CONTAINER } from '@/components/home/ui/styles';
import { EASE_OUT } from '@/animations/variants';

const MotionDiv = motion.div;
const MotionFigure = motion.figure;

// Long-form reading styles for the CMS HTML. The content can carry inline
// styles (fonts, sizes, colours pasted from editors), so the base resets use
// `!` to hand typography back to the page and keep it legible in both themes.
// Headings also need `!` to beat the global unlayered h1–h6 rule.
const PROSE = [
  'mx-auto w-full max-w-[68ch] min-w-0 break-words [overflow-wrap:anywhere]',
  'text-[17px] leading-relaxed text-ink-soft',
  '[&_*]:!max-w-full [&_*]:![font-family:inherit] [&_*]:![font-size:inherit] [&_*]:![color:inherit] [&_*]:![line-height:inherit]',
  'dark:[&_:not(pre,code,th,td)]:!bg-transparent',
  // Rhythm
  '[&_p]:mb-6 [&>*:first-child]:!mt-0 [&>*:last-child]:!mb-0',
  // Headings
  '[&_:is(h1,h2,h3,h4,h5,h6)]:!font-display [&_:is(h1,h2,h3,h4,h5,h6)]:!font-medium [&_:is(h1,h2,h3,h4,h5,h6)]:!text-ink',
  '[&_:is(h1,h2,h3,h4,h5,h6)]:scroll-mt-28',
  '[&_:is(h1,h2)]:!text-[clamp(1.6rem,3vw,2.1rem)] [&_:is(h1,h2)]:!leading-[1.12] [&_:is(h1,h2)]:!tracking-[-0.03em] [&_:is(h1,h2)]:mb-5 [&_:is(h1,h2)]:mt-14',
  '[&_h3]:!text-[1.4rem] [&_h3]:!leading-[1.2] [&_h3]:!tracking-[-0.025em] [&_h3]:mb-4 [&_h3]:mt-10',
  '[&_:is(h4,h5,h6)]:!text-[1.15rem] [&_:is(h4,h5,h6)]:!leading-snug [&_:is(h4,h5,h6)]:!tracking-[-0.015em] [&_:is(h4,h5,h6)]:mb-3 [&_:is(h4,h5,h6)]:mt-8',
  // Inline
  '[&_:is(strong,b)]:!text-ink [&_:is(strong,b)]:font-semibold',
  '[&_a]:!text-accent [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-4 [&_a:hover]:decoration-2',
  // Lists
  '[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_li]:mb-2 [&_li]:pl-1.5 [&_li::marker]:text-accent',
  // Quotes
  '[&_blockquote]:my-10 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-6',
  '[&_blockquote]:!font-serif [&_blockquote]:italic [&_blockquote]:!text-[1.5rem] [&_blockquote]:!leading-[1.35] [&_blockquote]:!text-ink',
  // Media
  '[&_img]:my-10 [&_img]:!h-auto [&_img]:rounded-2xl',
  '[&_figure]:my-10 [&_figcaption]:mt-3 [&_figcaption]:!text-sm [&_figcaption]:!text-ink-faint',
  '[&_iframe]:my-10 [&_iframe]:aspect-video [&_iframe]:!h-auto [&_iframe]:w-full [&_iframe]:rounded-2xl',
  '[&_video]:my-10 [&_video]:rounded-2xl',
  // Rules, tables, code
  '[&_hr]:my-12 [&_hr]:border-line',
  '[&_table]:my-8 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:!text-[15px]',
  '[&_:is(th,td)]:border [&_:is(th,td)]:border-line [&_:is(th,td)]:px-3 [&_:is(th,td)]:py-2 [&_:is(th,td)]:text-left [&_th]:!text-ink [&_th]:font-medium',
  '[&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-mist [&_pre]:p-5 [&_pre]:!text-sm',
  '[&_code]:rounded [&_code]:bg-mist [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:!text-[0.9em]',
].join(' ');

function BackLink({ className = '' }) {
  return (
    <Link
      to="/blog"
      className={`group inline-flex min-h-11 items-center gap-2.5 text-sm font-medium text-ink-soft transition-colors duration-300 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-inset ring-line transition-colors duration-300 group-hover:bg-ink group-hover:text-canvas">
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
      </span>
      Back to Blog
    </Link>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlog();
    window.scrollTo(0, 0);
  }, [slug]);

  async function loadBlog() {
    try {
      const res = await blogService.getBlogBySlug(slug);
      const data = res.data?.data || res.data;
      setBlog(data);
      document.title = `${data?.title || 'Blog'} — 1SkyStore`;
    } catch {
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`${CONTAINER} pb-24 pt-10 sm:pt-14`} aria-busy="true" aria-label="Loading article">
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          <Skeleton variant="line" className="mx-auto w-28 rounded-full" />
          <Skeleton variant="title" className="mx-auto h-10 rounded-full" />
          <Skeleton variant="title" className="mx-auto h-10 w-1/2 rounded-full" />
          <Skeleton variant="line" className="mx-auto w-48 rounded-full" />
        </div>
        <div className="skeleton-shimmer mx-auto mt-12 aspect-[16/9] max-w-[1200px] rounded-[2rem]" />
        <div className="mx-auto mt-12 max-w-[68ch] space-y-3">
          <Skeleton variant="text" className="rounded-full" />
          <Skeleton variant="text" className="rounded-full" />
          <Skeleton variant="text" className="w-3/4 rounded-full" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={`${CONTAINER} flex min-h-[60vh] items-center py-16`}>
        <StatusMessage title="Post not found" action={{ to: '/blog', label: 'Back to Blog' }} className="w-full" />
      </div>
    );
  }

  const topic = blog.category;

  return (
    <div className="bg-canvas pb-24 pt-6 sm:pb-32 sm:pt-10">
      <div className={CONTAINER}>
        <BackLink />

        <article className="mt-8 sm:mt-12">
          <MotionDiv
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
            className="mx-auto max-w-4xl text-center"
          >
            {topic && (
              <p className="inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                {topic}
              </p>
            )}
            <h1 className="mt-5 text-balance font-display text-[clamp(2.1rem,5vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.04em] text-ink">
              {blog.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-faint">
              {blog.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {blog.createdAt && <span className="h-1 w-1 rounded-full bg-ink-faint/40" aria-hidden="true" />}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" /> {readingMinutes(blog.content)} min read
              </span>
            </div>
          </MotionDiv>

          {blog.cover_image_url && (
            <MotionFigure
              initial={{ opacity: 0, y: 24, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.15, ease: EASE_OUT }}
              className="mx-auto mt-10 max-w-[1200px] overflow-hidden rounded-[1.75rem] bg-mist sm:mt-14 sm:rounded-[2rem]"
            >
              <img
                src={blog.cover_image_url}
                alt={blog.title}
                decoding="async"
                fetchPriority="high"
                className="block h-auto max-h-[75vh] w-full object-cover"
              />
            </MotionFigure>
          )}

          <MotionDiv
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE_OUT }}
            className="mt-12 sm:mt-16"
          >
            {/* CMS HTML can carry pasted widths/utility classes; never let it widen the page */}
            <div
              className={`${PROSE} min-w-0 overflow-x-hidden break-words [&_*]:max-w-full`}
              dangerouslySetInnerHTML={{ __html: blog.content || '<p>Content not available.</p>' }}
            />
          </MotionDiv>
        </article>

        <div className="mx-auto mt-16 max-w-[68ch] border-t border-line pt-8 sm:mt-20">
          <BackLink />
        </div>
      </div>
    </div>
  );
}

/** Rough reading time for CMS HTML at ~200 words per minute */
function readingMinutes(html = '') {
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
