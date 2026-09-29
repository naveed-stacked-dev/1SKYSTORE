const brandService = require('../services/brand.service');

// ─── LIST PUBLIC BRANDS ──────────────────────────────────────────────────────
// @route  GET /api/v1/brands
exports.listBrands = async (req, res) => {
  try {
    const brands = await brandService.listPublicBrands();
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
