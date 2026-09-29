const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'manager'),
    defaultValue: 'manager',
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of permission strings e.g. ["products", "orders", "users"]',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'admins',
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
  ],
});

Admin.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

Admin.beforeCreate(async (admin) => {
  if (admin.password_hash) {
    admin.password_hash = await bcrypt.hash(admin.password_hash, 12);
  }
});

Admin.beforeUpdate(async (admin) => {
  if (admin.changed('password_hash') && admin.password_hash) {
    admin.password_hash = await bcrypt.hash(admin.password_hash, 12);
  }
});

module.exports = Admin;
