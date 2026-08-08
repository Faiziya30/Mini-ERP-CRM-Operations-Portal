const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SalesChallan = sequelize.define('SalesChallan', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    challanNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('Draft', 'Confirmed', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Draft'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'sales_challans',
    indexes: [
      { unique: true, fields: ['challanNumber'] },
      { fields: ['status'] },
      { fields: ['customerId'] },
      { fields: ['createdAt'] }
    ]
  });

  return SalesChallan;
};
