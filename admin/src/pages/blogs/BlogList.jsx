import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';
import DataTable from '@/components/tables/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import blogService from '@/api/blog.service';
import { formatDate, truncate } from '@/utils/formatters';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import BlogForm from './BlogForm';

export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogService.getAll({ page, pageSize: 10 });
      const data = res.data?.data || res.data;
      const pagination = res.data?.pagination;
      setBlogs(Array.isArray(data) ? data : data?.blogs || data?.rows || []);
      setTotalPages(pagination?.totalPages || data?.totalPages || data?.total_pages || 1);
    } catch {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await blogService.delete(deleteModal);
      toast.success('Blog deleted');
      setDeleteModal(null);
      fetchBlogs();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleFormClose = (refresh) => {
    setShowForm(false);
    setEditBlog(null);
    if (refresh) fetchBlogs();
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {row.cover_image_url ? (
            <img src={row.cover_image_url} alt="" className="w-12 h-8 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0" />
          ) : (
            <div className="w-12 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0" />
          )}
          <div>
            <p className="font-medium text-neutral-800 dark:text-neutral-200">{truncate(val, 40)}</p>
            <p className="text-xs text-neutral-400">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'author',
      label: 'Author',
      render: (val) => (
        <span className="text-neutral-600 dark:text-neutral-300 text-sm">{val?.first_name || val?.email || '—'}</span>
      ),
    },
    {
      key: 'is_published',
      label: 'Status',
      render: (val) => <Badge variant={val ? 'success' : 'default'}>{val ? 'Published' : 'Draft'}</Badge>,
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (val) => (
        <div className="flex flex-wrap gap-1">
          {(val || []).slice(0, 3).map((tag, i) => (
            <span key={i} className="px-1.5 py-0.5 text-xs rounded bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">{tag}</span>
          ))}
          {(val || []).length > 3 && <span className="text-xs text-neutral-400">+{val.length - 3}</span>}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (val, row) => <span className="text-neutral-500">{formatDate(val || row.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: '',
      width: '120px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/admin/blogs/${row.id}`)} className="p-1.5 rounded-lg text-neutral-400 hover:text-info-500 hover:bg-info-50 dark:hover:bg-info-500/10 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => { setEditBlog(row); setShowForm(true); }} className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteModal(row.id)} className="p-1.5 rounded-lg text-neutral-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div {...pageTransition}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">Blogs</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage blog posts</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={blogs}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No blog posts found"
      />

      {showForm && <BlogForm blog={editBlog} onClose={handleFormClose} />}

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Blog" size="sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">Are you sure? This cannot be undone.</p>
        <div className="flex items-center gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
