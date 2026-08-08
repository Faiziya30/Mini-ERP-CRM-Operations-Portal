const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(180),
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true
    },
    category: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currentStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    minStockAlert: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    warehouseLocation: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {

    tableName: 'products',
    indexes: [
      { unique: true, fields: ['sku'] },
      { fields: ['name'] },
      { fields: ['category'] }
    ]
  });

  return Product;
};
