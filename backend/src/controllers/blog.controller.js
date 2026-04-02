const blogService = require('../services/blog.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

exports.listBlogs = catchAsync(async (req, res) => {
  const result = await blogService.listPublicBlogs(req.query);
  ApiResponse.paginated(res, 'Blogs fetched', result.blogs, result.pagination);
});

exports.getBlogBySlug = catchAsync(async (req, res) => {
  const blog = await blogService.getBlogBySlug(req.params.slug);
  ApiResponse.success(res, 'Blog fetched', blog);
});

// ─── ADMIN ───────────────────────────────────────────────────────────────────

exports.adminListBlogs = catchAsync(async (req, res) => {
  const result = await blogService.adminListBlogs(req.query);
  ApiResponse.paginated(res, 'Blogs fetched', result.blogs, result.pagination);
});

exports.adminGetBlog = catchAsync(async (req, res) => {
  const blog = await blogService.getBlogById(req.params.id);
  ApiResponse.success(res, 'Blog fetched', blog);
});

exports.createBlog = catchAsync(async (req, res) => {
  const blogData = { ...req.body };
  // the middleware uses multer.array('images') by default across the app 
  // so the file comes in req.files
  const blog = await blogService.createBlog(req.admin.id, blogData, req.files);
  ApiResponse.created(res, 'Blog created', blog);
});

exports.updateBlog = catchAsync(async (req, res) => {
  const blogData = { ...req.body };
  const blog = await blogService.updateBlog(req.params.id, blogData, req.files);
  ApiResponse.success(res, 'Blog updated', blog);
});

exports.deleteBlog = catchAsync(async (req, res) => {
  const result = await blogService.deleteBlog(req.params.id);
  ApiResponse.success(res, result.message);
});
