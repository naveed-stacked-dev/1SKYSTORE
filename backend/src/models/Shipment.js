const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shipment = sequelize.define('Shipment', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  shiprocket_order_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  shiprocket_shipment_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  awb_code: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Air Waybill number for tracking',
  },
  courier_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  courier_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled'),
    defaultValue: 'pending',
  },
  tracking_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  estimated_delivery: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  shipping_charge: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
}, {
  tableName: 'shipments',
  indexes: [
    { fields: ['order_id'] },
    { fields: ['awb_code'] },
    { fields: ['status'] },
  ],
});

module.exports = Shipment;
