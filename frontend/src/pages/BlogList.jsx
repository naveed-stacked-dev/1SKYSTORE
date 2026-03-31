import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import blogService from '@/api/blog.service';
import { BlogCardSkeleton } from '@/components/ui/Skeleton';
import { pageTransition, staggerContainer, staggerItem } from '@/animations/variants';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Blog — 1SkyStore';
    loadBlogs();
  }, []);

  async function loadBlogs() {
    try {
      const res = await blogService.getBlogs();
      const data = res.data?.data || res.data;
      setBlogs(Array.isArray(data) ? data : data?.blogs || data?.rows || []);
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div {...pageTransition}>
      <div className="bg-neutral-50/50 dark:bg-neutral-900/30 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 dark:text-white">Blog</h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">Insights on homeopathy, wellness, and natural health</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        ) : blogs.length === 0 ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <p className="text-neutral-400">No blog posts yet</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {blogs.map((blog) => (
              <motion.div key={blog.id} variants={staggerItem}>
                <Link
                  to={`/blog/${blog.slug || blog.id}`}
                  className="group block rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:shadow-card transition-shadow"
                >
                  {blog.image && (
                    <div className="aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5">
                    {blog.category && (
                      <span className="text-xs font-medium text-primary-500 uppercase tracking-wider">{blog.category}</span>
                    )}
                    <h2 className="mt-2 text-lg font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-2 group-hover:text-primary-500 transition-colors">
                      {blog.title}
                    </h2>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-3">
                      {blog.excerpt || blog.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <Calendar className="w-3 h-3" />
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ''}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-primary-500">
                        Read more <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
