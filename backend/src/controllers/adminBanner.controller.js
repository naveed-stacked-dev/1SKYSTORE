const { Banner } = require('../models');
const { deleteFromS3 } = require('../services/s3Service');

// ─── UPLOAD BANNERS ──────────────────────────────────────────────────────────
// @route   POST /api/v1/admin/banners/upload?type=hero|info
// @access  Private/Admin
exports.uploadBanners = async (req, res) => {
  try {
    const type = req.query.type || req.body.type;
    const device_type = req.query.device_type || req.body.device_type || 'desktop';

    if (!type || !['hero', 'info'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Query param "type" must be "hero" or "info"',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files uploaded' });
    }

    // ── INFO: enforce single-image rule ──────────────────────────────────────
    if (type === 'info') {
      const existing = await Banner.findOne({ where: { type: 'info', device_type } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `An info banner for ${device_type} already exists. Delete it first before uploading a new one.`,
        });
      }
      if (req.files.length > 1) {
        return res.status(400).json({
          success: false,
          message: 'Info banner allows only 1 image at a time.',
        });
      }
    }

    // ── Create DB records for each uploaded file ──────────────────────────────
    const created = await Promise.all(
      req.files.map((file, index) =>
        Banner.create({
          type,
          device_type,
          image_url: file.location,   // multer-s3 provides .location
          order: index,
          is_active: true,
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `${created.length} banner(s) uploaded successfully`,
      data: created,
    });
  } catch (error) {
    console.error('Banner upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};

// ─── GET BANNERS ─────────────────────────────────────────────────────────────
// @route   GET /api/v1/admin/banners?type=hero|info
// @access  Private/Admin
exports.getBanners = async (req, res) => {
  try {
    const { type, device_type } = req.query;
    const where = {};
    if (type && ['hero', 'info'].includes(type)) {
      where.type = type;
    }
    if (device_type) {
      where.device_type = device_type;
    }

    const banners = await Banner.findAll({
      where,
      order: [
        ['order', 'ASC'],
        ['created_at', 'DESC'],
      ],
    });

    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch banners', error: error.message });
  }
};

// ─── DELETE BANNER ───────────────────────────────────────────────────────────
// @route   DELETE /api/v1/admin/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    // Delete from S3 (non-fatal if it fails — e.g. already deleted)
    if (banner.image_url) {
      try {
        await deleteFromS3(banner.image_url);
      } catch (s3Err) {
        console.error(`S3 delete failed for ${banner.image_url}:`, s3Err.message);
      }
    }

    await banner.destroy();

    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete banner', error: error.message });
  }
};

// ─── CREATE BANNER (legacy – accepts pre-uploaded URL) ───────────────────────
// @route   POST /api/v1/admin/banners
// @access  Private/Admin
exports.createBanner = async (req, res) => {
  try {
    const { type, image_url, link, order, is_active } = req.body;

    if (!image_url) {
      return res.status(400).json({ success: false, message: 'image_url is required' });
    }

    const banner = await Banner.create({
      type: type || 'hero',
      image_url,
      link,
      order: order ?? 0,
      is_active: is_active !== undefined ? is_active : true,
    });

    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create banner', error: error.message });
  }
};

// ─── UPDATE BANNER ───────────────────────────────────────────────────────────
// @route   PUT /api/v1/admin/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    await banner.update(req.body);

    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update banner', error: error.message });
  }
};
