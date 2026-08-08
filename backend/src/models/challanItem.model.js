const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChallanItem = sequelize.define('ChallanItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    challanId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productNameSnapshot: {
      type: DataTypes.STRING(180),
      allowNull: false
    },
    productSkuSnapshot: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    unitPriceSnapshot: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'challan_items',
    indexes: [
      { fields: ['challanId'] },
      { fields: ['productId'] }
    ]
  });

  return ChallanItem;
};
