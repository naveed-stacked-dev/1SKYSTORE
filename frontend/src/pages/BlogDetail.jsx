import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import blogService from '@/api/blog.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { pageTransition } from '@/animations/variants';

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
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <Skeleton variant="line" className="w-1/3" />
        <Skeleton variant="title" className="h-10" />
        <Skeleton variant="image" className="h-64 mt-4" />
        <Skeleton variant="text" /><Skeleton variant="text" /><Skeleton variant="text" className="w-3/4" />
      </div>
    );
  }

  if (!blog) {
    return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-neutral-500">Post not found</p></div>;
  }

  return (
    <motion.div {...pageTransition} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-500 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <article>
        {blog.category && (
          <span className="text-xs font-medium text-primary-500 uppercase tracking-wider">{blog.category}</span>
        )}
        <h1 className="mt-2 text-3xl sm:text-4xl font-heading font-bold text-neutral-900 dark:text-white leading-tight">
          {blog.title}
        </h1>
        <div className="flex items-center gap-4 mt-4 text-sm text-neutral-400">
          {blog.createdAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> 5 min read
          </span>
        </div>

        {blog.image && (
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full rounded-2xl mt-8 aspect-video object-cover"
          />
        )}

        <div
          className="mt-8 prose prose-neutral dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary-500"
          dangerouslySetInnerHTML={{ __html: blog.content || '<p>Content not available.</p>' }}
        />
      </article>
    </motion.div>
  );
}
