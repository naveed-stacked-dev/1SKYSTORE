import API from './axios';

const blogService = {
  getBlogs: (params = {}, config = {}) => API.get('/blogs', { params, ...config }),
  getBlogBySlug: (slug, config = {}) => API.get(`/blogs/${slug}`, config),

  // Admin
  adminGetBlogs: (params = {}) => API.get('/admin/blogs', { params }),
  adminCreateBlog: (data) => API.post('/admin/blogs', data),
  adminUpdateBlog: (id, data) => API.put(`/admin/blogs/${id}`, data),
  adminDeleteBlog: (id) => API.delete(`/admin/blogs/${id}`),
};

export default blogService;
