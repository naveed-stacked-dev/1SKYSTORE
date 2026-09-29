const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImportLog = sequelize.define('ImportLog', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  admin_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  total_rows: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  success_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  error_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  errors_json: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of { row, field, message } objects',
  },
  status: {
    type: DataTypes.ENUM('processing', 'completed', 'failed'),
    defaultValue: 'processing',
  },
}, {
  tableName: 'import_logs',
  indexes: [
    { fields: ['admin_id'] },
    { fields: ['status'] },
  ],
});

module.exports = ImportLog;
