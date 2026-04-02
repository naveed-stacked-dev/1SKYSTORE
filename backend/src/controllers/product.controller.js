const productService = require('../services/product.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

exports.listProducts = catchAsync(async (req, res) => {
  // Public listing only shows active products
  req.query.is_active = true;
  const result = await productService.listProducts(req.query);
  ApiResponse.paginated(res, 'Products fetched', result.products, result.pagination);
});

exports.getProductBySlug = catchAsync(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  ApiResponse.success(res, 'Product fetched', product);
});

exports.getCategories = catchAsync(async (req, res) => {
  const categories = await productService.getCategories();
  ApiResponse.success(res, 'Categories fetched', categories);
});

exports.getBrands = catchAsync(async (req, res) => {
  const brands = await productService.getBrands();
  ApiResponse.success(res, 'Brands fetched', brands);
});

exports.getBestProducts = catchAsync(async (req, res) => {
  const products = await productService.getBestProducts(req.query.limit);
  ApiResponse.success(res, 'Best products fetched', products);
});

exports.getProductsByBrand = catchAsync(async (req, res) => {
  const result = await productService.getProductsByBrand(req.query.brandLimit, req.query.productLimit);
  ApiResponse.success(res, 'Products by brand fetched', result);
});

exports.getProductsByCategory = catchAsync(async (req, res) => {
  const result = await productService.getProductsByCategory(req.query.categoryLimit, req.query.productLimit);
  ApiResponse.success(res, 'Products by category fetched', result);
});

// ─── ADMIN ───────────────────────────────────────────────────────────────────

exports.adminListProducts = catchAsync(async (req, res) => {
  const result = await productService.listProducts(req.query);
  ApiResponse.paginated(res, 'Products fetched', result.products, result.pagination);
});

exports.adminGetProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  ApiResponse.success(res, 'Product fetched', product);
});

exports.createProduct = catchAsync(async (req, res) => {
  delete req.body.images; // ensure no images array from body is used
  const productData = { ...req.body };
  const product = await productService.createProduct(productData, req.files || []);
  ApiResponse.created(res, 'Product created', product);
});

exports.updateProduct = catchAsync(async (req, res) => {
  delete req.body.images; // ensure no images array from body is used
  const productData = { ...req.body };
  const product = await productService.updateProduct(req.params.id, productData, req.files || []);
  ApiResponse.success(res, 'Product updated', product);
});

exports.deleteProduct = catchAsync(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  ApiResponse.success(res, result.message);
});

exports.toggleProduct = catchAsync(async (req, res) => {
  const product = await productService.toggleProductStatus(req.params.id);
  ApiResponse.success(res, `Product ${product.is_active ? 'activated' : 'deactivated'}`, product);
});

exports.bulkImport = catchAsync(async (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, 400, 'Excel file is required');
  }
  const importLog = await productService.bulkImport(
    req.file.buffer,
    req.admin.id,
    req.file.originalname
  );
  ApiResponse.success(res, 'Bulk import completed', importLog);
});
