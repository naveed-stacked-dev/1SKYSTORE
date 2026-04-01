import API from './axios';

const blogService = {
  getAll: (params) => API.get('/admin/blogs', { params }),
  getById: (id) => API.get(`/admin/blogs/${id}`),
  create: (data) => API.post('/admin/blogs', data),
  update: (id, data) => API.put(`/admin/blogs/${id}`, data),
  delete: (id) => API.delete(`/admin/blogs/${id}`),
};

export default blogService;
