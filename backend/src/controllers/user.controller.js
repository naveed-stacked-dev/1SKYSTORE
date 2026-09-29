const { User } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { decryptFields } = require('../utils/encryption');

exports.getProfile = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'email', 'first_name', 'last_name', 'phone_enc', 'is_verified', 'created_at'],
  });

  const decrypted = decryptFields(user, ['phone_enc']);
  // Rename phone_enc to phone in response
  decrypted.phone = decrypted.phone_enc;
  delete decrypted.phone_enc;

  ApiResponse.success(res, 'Profile fetched', decrypted);
});

exports.updateProfile = catchAsync(async (req, res) => {
  const { first_name, last_name, phone } = req.body;
  const updateData = {};
  if (first_name) updateData.first_name = first_name;
  if (last_name) updateData.last_name = last_name;
  if (phone) {
    const { encrypt } = require('../utils/encryption');
    updateData.phone_enc = encrypt(phone);
  }

  await User.update(updateData, { where: { id: req.user.id } });
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'email', 'first_name', 'last_name', 'phone_enc', 'is_verified'],
  });

  const decrypted = decryptFields(user, ['phone_enc']);
  decrypted.phone = decrypted.phone_enc;
  delete decrypted.phone_enc;

  ApiResponse.success(res, 'Profile updated', decrypted);
});
