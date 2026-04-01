const { User, Order, OrderItem, Product, Address } = require('../models');
const { Op } = require('sequelize');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { decryptFields } = require('../utils/encryption');

exports.listUsers = catchAsync(async (req, res) => {
  const { limit, offset, page, pageSize } = getPagination(req.query);

  const where = {};

  if (req.query.search) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${req.query.search}%` } },
      { last_name: { [Op.like]: `%${req.query.search}%` } },
      { email: { [Op.like]: `%${req.query.search}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: ['id', 'email', 'first_name', 'last_name', 'phone_enc', 'is_verified', 'created_at'],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  // Decrypt phone numbers
  const users = rows.map((u) => {
    const plain = u.get({ plain: true });
    const decrypted = decryptFields(u, ['phone_enc']);
    plain.phone = decrypted.phone_enc || null;
    delete plain.phone_enc;
    return plain;
  });

  ApiResponse.paginated(res, 'Users fetched', users, getPaginationMeta(count, page, pageSize));
});

exports.getUserById = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ['id', 'email', 'first_name', 'last_name', 'phone_enc', 'is_verified', 'created_at'],
    include: [{ model: Address, as: 'addresses' }],
  });

  if (!user) {
    return ApiResponse.error(res, 404, 'User not found');
  }

  const plain = user.get({ plain: true });
  const decrypted = decryptFields(user, ['phone_enc']);
  plain.phone = decrypted.phone_enc || null;
  delete plain.phone_enc;

  ApiResponse.success(res, 'User fetched', plain);
});

exports.getUserOrders = catchAsync(async (req, res) => {
  const orders = await Order.findAll({
    where: { user_id: req.params.id },
    include: [
      {
        model: OrderItem, as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  ApiResponse.success(res, 'User orders fetched', orders);
});
