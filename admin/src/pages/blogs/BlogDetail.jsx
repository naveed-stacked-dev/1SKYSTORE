import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import blogService from '@/api/blog.service';
import { formatDate } from '@/utils/formatters';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await blogService.getById(id);
        setBlog(res.data?.data || res.data);
      } catch {
        toast.error('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500 mb-4">Blog not found</p>
        <Button variant="outline" onClick={() => navigate('/admin/blogs')}>
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Button>
      </div>
    );
  }

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/blogs')}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">
              {blog.title}
            </h1>
            <Badge variant={blog.is_published ? 'success' : 'default'}>
              {blog.is_published ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(blog.published_at || blog.created_at || blog.createdAt)}
            </div>
            {blog.author && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {blog.author?.first_name || blog.author?.email}
              </div>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/blogs')}>
          Back
        </Button>
      </div>

      {/* Cover Image */}
      {blog.cover_image_url && (
        <div className="rounded-2xl overflow-hidden mb-6">
          <img src={blog.cover_image_url} alt={blog.title} className="w-full h-64 object-cover" />
        </div>
      )}

      {/* Excerpt */}
      {blog.excerpt && (
        <div className="bg-primary-50/50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/10 rounded-xl p-4 mb-6">
          <p className="text-sm text-primary-800 dark:text-primary-300 italic">{blog.excerpt}</p>
        </div>
      )}

      {/* Content */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-8">
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <Tag className="w-4 h-4 text-neutral-400" />
          {blog.tags.map((tag, i) => (
            <span key={i} className="px-2.5 py-1 text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* SEO Info */}
      {(blog.meta_title || blog.meta_description) && (
        <div className="mt-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">SEO</h4>
          {blog.meta_title && (
            <p className="text-sm text-neutral-700 dark:text-neutral-300"><strong>Meta Title:</strong> {blog.meta_title}</p>
          )}
          {blog.meta_description && (
            <p className="text-sm text-neutral-700 dark:text-neutral-300"><strong>Meta Description:</strong> {blog.meta_description}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}
