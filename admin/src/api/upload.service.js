import API from './axios';

const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return API.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return API.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getGallery: () => API.get('/upload/gallery'),
};

export default uploadService;
