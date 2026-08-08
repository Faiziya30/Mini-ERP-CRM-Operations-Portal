const sequelize = require('../config/db');

const User = require('./user.model')(sequelize);
const Customer = require('./customer.model')(sequelize);
const CustomerFollowUp = require('./customerFollowUp.model')(sequelize);
const Product = require('./product.model')(sequelize);
const StockMovement = require('./stockMovement.model')(sequelize);
const SalesChallan = require('./salesChallan.model')(sequelize);
const ChallanItem = require('./challanItem.model')(sequelize);

User.hasMany(Customer, { foreignKey: 'createdBy', as: 'customersCreated' });
Customer.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Customer.hasMany(CustomerFollowUp, {
  foreignKey: 'customerId',
  as: 'followUps',
  onDelete: 'CASCADE'
});
CustomerFollowUp.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
CustomerFollowUp.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });

Product.hasMany(StockMovement, {
  foreignKey: 'productId',
  as: 'stockMovements',
  onDelete: 'CASCADE'
});
StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
StockMovement.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });

Customer.hasMany(SalesChallan, { foreignKey: 'customerId', as: 'challans' });
SalesChallan.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
SalesChallan.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });

SalesChallan.hasMany(ChallanItem, {
  foreignKey: 'challanId',
  as: 'items',
  onDelete: 'CASCADE'
});
ChallanItem.belongsTo(SalesChallan, { foreignKey: 'challanId', as: 'challan' });
ChallanItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  User,
  Customer,
  CustomerFollowUp,
  Product,
  StockMovement,
  SalesChallan,
  ChallanItem
};
