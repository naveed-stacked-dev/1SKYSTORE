import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Toggle from '@/components/ui/Toggle';
import blogService from '@/api/blog.service';
import uploadService from '@/api/upload.service';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

export default function BlogForm({ blog, onClose }) {
  const isEdit = !!blog;
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    is_published: false,
    meta_title: '',
    meta_description: '',
    tags: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (blog) {
      setForm({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        is_published: blog.is_published ?? false,
        meta_title: blog.meta_title || '',
        meta_description: blog.meta_description || '',
        tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
      });
      setCoverPreview(blog.cover_image_url || null);
    }
  }, [blog]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.content.trim()) errs.content = 'Content is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const tagsArray = form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      if (form.excerpt) formData.append('excerpt', form.excerpt);
      formData.append('is_published', form.is_published);
      if (form.meta_title) formData.append('meta_title', form.meta_title);
      if (form.meta_description) formData.append('meta_description', form.meta_description);
      
      if (tagsArray.length > 0) {
        tagsArray.forEach((tag) => formData.append('tags[]', tag));
      }

      if (coverFile) {
        formData.append('images', coverFile);
      } else if (!coverPreview) {
        formData.append('retainedImage', '');
      } else {
        formData.append('retainedImage', coverPreview);
      }

      if (isEdit) {
        await blogService.update(blog.id, formData);
        toast.success('Blog updated');
      } else {
        await blogService.create(formData);
        toast.success('Blog created');
      }
      onClose(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={() => onClose(false)} title={isEdit ? 'Edit Blog' : 'Create Blog'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Title" value={form.title} onChange={(e) => onChange('title', e.target.value)} error={errors.title} placeholder="Blog post title" />

        <Textarea label="Excerpt" value={form.excerpt} onChange={(e) => onChange('excerpt', e.target.value)} placeholder="Short summary for previews..." rows={2} />

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Cover Image</label>
          {coverPreview ? (
            <div className="relative rounded-xl overflow-hidden mb-2 group">
              <img src={coverPreview} alt="Cover" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
              <Upload className="w-6 h-6 text-neutral-400 mb-1" />
              <span className="text-sm text-neutral-400">Click to upload cover image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Content</label>
          <div
            contentEditable
            suppressContentEditableWarning
            className="w-full min-h-[200px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 prose prose-sm dark:prose-invert max-w-none overflow-y-auto"
            onBlur={(e) => onChange('content', e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: form.content }}
          />
          {errors.content && <p className="mt-1 text-xs text-error-500">{errors.content}</p>}
        </div>

        {/* Tags */}
        <Input label="Tags" value={form.tags} onChange={(e) => onChange('tags', e.target.value)} placeholder="health, homeopathy, remedies (comma separated)" />

        {/* SEO Fields */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">SEO Settings</h4>
          <Input label="Meta Title" value={form.meta_title} onChange={(e) => onChange('meta_title', e.target.value)} placeholder="SEO title (optional)" />
          <Textarea label="Meta Description" value={form.meta_description} onChange={(e) => onChange('meta_description', e.target.value)} placeholder="SEO description (optional)" rows={2} />
        </div>

        <Toggle checked={form.is_published} onChange={(val) => onChange('is_published', val)} label="Publish immediately" />

        <div className="flex items-center gap-3 justify-end pt-2">
          <Button variant="ghost" type="button" onClick={() => onClose(false)}>Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}
