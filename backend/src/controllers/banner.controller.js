const { Banner } = require('../models');

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { is_active: true },
      order: [['order', 'ASC'], ['created_at', 'DESC']],
    });

    const heroDesktop = banners.filter((b) => b.type === 'hero' && b.device_type === 'desktop');
    const heroMobile = banners.filter((b) => b.type === 'hero' && b.device_type === 'mobile');
    const infoDesktop = banners.filter((b) => b.type === 'info' && b.device_type === 'desktop');
    const infoMobile = banners.filter((b) => b.type === 'info' && b.device_type === 'mobile');

    res.status(200).json({
      success: true,
      data: {
        hero: heroDesktop, // legacy map to avoid breaking existing clients that just use 'hero' expecting arr
        heroDesktop,
        heroMobile,
        info: infoDesktop.length > 0 ? infoDesktop[0] : null,
        infoMobile: infoMobile.length > 0 ? infoMobile[0] : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error.message,
    });
  }
};
