const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
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
    allowNull: true, // null for social login users
  },
  phone_enc: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'AES-256 encrypted phone number',
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  firebase_uid: {
    type: DataTypes.STRING(128),
    allowNull: true,
    unique: true,
    comment: 'Firebase UID for Google login',
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  email_verification_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  password_reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'] },
    { fields: ['firebase_uid'] },
  ],
});

// Instance method: compare password
User.prototype.comparePassword = async function (candidatePassword) {
  if (!this.password_hash) return false;
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Hook: hash password before create/update
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    user.password_hash = await bcrypt.hash(user.password_hash, 12);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password_hash') && user.password_hash) {
    user.password_hash = await bcrypt.hash(user.password_hash, 12);
  }
});

module.exports = User;
