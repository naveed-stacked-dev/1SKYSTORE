const brandService = require('../services/brand.service');

// ─── LIST ALL BRANDS (admin) ─────────────────────────────────────────────────
// @route  GET /api/v1/admin/brands
exports.listBrands = async (req, res) => {
  try {
    const brands = await brandService.listBrands(req.query);
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// ─── GET BRAND BY ID ─────────────────────────────────────────────────────────
// @route  GET /api/v1/admin/brands/:id
exports.getBrand = async (req, res) => {
  try {
    const brand = await brandService.getBrandById(req.params.id);
    res.json({ success: true, data: brand });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// ─── CREATE BRAND ────────────────────────────────────────────────────────────
// @route  POST /api/v1/admin/brands
exports.createBrand = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Brand name is required' });
    }
    const brand = await brandService.createBrand(req.body, req.file);
    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE BRAND ────────────────────────────────────────────────────────────
// @route  PUT /api/v1/admin/brands/:id
exports.updateBrand = async (req, res) => {
  try {
    const brand = await brandService.updateBrand(req.params.id, req.body, req.file);
    res.json({ success: true, data: brand });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// ─── DELETE BRAND ────────────────────────────────────────────────────────────
// @route  DELETE /api/v1/admin/brands/:id
exports.deleteBrand = async (req, res) => {
  try {
    const result = await brandService.deleteBrand(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// ─── TOGGLE BRAND STATUS ─────────────────────────────────────────────────────
// @route  PATCH /api/v1/admin/brands/:id/toggle
exports.toggleBrand = async (req, res) => {
  try {
    const brand = await brandService.toggleBrandStatus(req.params.id);
    res.json({ success: true, data: brand });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};
