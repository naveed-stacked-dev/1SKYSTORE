const { Address } = require('../models');
const ApiError = require('../utils/ApiError');
const { encrypt, decryptFields } = require('../utils/encryption');

const ENCRYPTED_FIELDS = ['phone_enc'];

/**
 * Create address
 */
async function createAddress(userId, data) {
  // If setting as default, unset existing default
  if (data.is_default) {
    await Address.update({ is_default: false }, { where: { user_id: userId } });
  }

  const address = await Address.create({
    user_id: userId,
    label: data.label,
    full_name: data.full_name,
    phone_enc: encrypt(data.phone),
    address_line1: data.address_line1,
    address_line2: data.address_line2,
    city: data.city,
    state: data.state,
    country: data.country,
    postal_code: data.postal_code,
    is_default: data.is_default || false,
  });

  return decryptFields(address, ENCRYPTED_FIELDS);
}

/**
 * Get all addresses for a user
 */
async function getUserAddresses(userId) {
  const addresses = await Address.findAll({
    where: { user_id: userId },
    order: [['is_default', 'DESC'], ['created_at', 'DESC']],
  });

  return addresses.map((addr) => decryptFields(addr, ENCRYPTED_FIELDS));
}

/**
 * Get address by ID (verify ownership)
 */
async function getAddressById(userId, addressId) {
  const address = await Address.findOne({
    where: { id: addressId, user_id: userId },
  });
  if (!address) throw ApiError.notFound('Address not found');
  return decryptFields(address, ENCRYPTED_FIELDS);
}

/**
 * Update address
 */
async function updateAddress(userId, addressId, data) {
  const address = await Address.findOne({
    where: { id: addressId, user_id: userId },
  });
  if (!address) throw ApiError.notFound('Address not found');

  if (data.is_default) {
    await Address.update({ is_default: false }, { where: { user_id: userId } });
  }

  const updateData = { ...data };
  if (data.phone) {
    updateData.phone_enc = encrypt(data.phone);
    delete updateData.phone;
  }

  await address.update(updateData);
  return decryptFields(address, ENCRYPTED_FIELDS);
}

/**
 * Delete address
 */
async function deleteAddress(userId, addressId) {
  const address = await Address.findOne({
    where: { id: addressId, user_id: userId },
  });
  if (!address) throw ApiError.notFound('Address not found');
  await address.destroy();
  return { message: 'Address deleted successfully' };
}

module.exports = { createAddress, getUserAddresses, getAddressById, updateAddress, deleteAddress };
