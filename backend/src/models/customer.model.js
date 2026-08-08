const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(160),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    businessName: {
      type: DataTypes.STRING(180),
      allowNull: false
    },
    gstNumber: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    customerType: {
      type: DataTypes.ENUM('Retail', 'Wholesale', 'Distributor'),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Lead', 'Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Lead'
    },
    followUpDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'customers',
    indexes: [
      { fields: ['name'] },
      { fields: ['mobile'] },
      { fields: ['businessName'] },
      { fields: ['status'] },
      { fields: ['customerType'] },
      { fields: ['isDeleted'] }
    ]
  });

  return Customer;
};
