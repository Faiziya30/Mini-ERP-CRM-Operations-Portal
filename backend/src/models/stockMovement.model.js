const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StockMovement = sequelize.define('StockMovement', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantityChanged: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    movementType: {
      type: DataTypes.ENUM('IN', 'OUT'),
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'stock_movements',
    updatedAt: false,
    indexes: [
      { fields: ['productId'] },
      { fields: ['movementType'] },
      { fields: ['createdAt'] }
    ]
  });

  return StockMovement;
};
