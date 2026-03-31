import API from './axios';

const blogService = {
  getBlogs: (params = {}) => API.get('/blogs', { params }),
  getBlogBySlug: (slug) => API.get(`/blogs/${slug}`),

  // Admin
  adminGetBlogs: (params = {}) => API.get('/admin/blogs', { params }),
  adminCreateBlog: (data) => API.post('/admin/blogs', data),
  adminUpdateBlog: (id, data) => API.put(`/admin/blogs/${id}`, data),
  adminDeleteBlog: (id) => API.delete(`/admin/blogs/${id}`),
};

export default blogService;
