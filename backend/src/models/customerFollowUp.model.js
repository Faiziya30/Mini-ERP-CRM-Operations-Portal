const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomerFollowUp = sequelize.define('CustomerFollowUp', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    followUpDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'customer_followups',
    indexes: [
      { fields: ['customerId'] },
      { fields: ['followUpDate'] }
    ]
  });

  return CustomerFollowUp;
};
