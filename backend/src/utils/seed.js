const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Customer,
  CustomerFollowUp,
  Product,
  StockMovement,
  SalesChallan,
  ChallanItem
} = require('../models');
const generateChallanNo = require('./generateChallanNo');

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@mini-erp.local',
    password: 'Admin@123',
    role: 'admin'
  },
  {
    name: 'Sales User',
    email: 'sales@mini-erp.local',
    password: 'Sales@123',
    role: 'sales'
  },
  {
    name: 'Warehouse User',
    email: 'warehouse@mini-erp.local',
    password: 'Warehouse@123',
    role: 'warehouse'
  },
  {
    name: 'Accounts User',
    email: 'accounts@mini-erp.local',
    password: 'Accounts@123',
    role: 'accounts'
  }
];

const seedData = async () => {
  for (const userData of demoUsers) {
    const existing = await User.findOne({ where: { email: userData.email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        isActive: true
      });
    }
  }

  const admin = await User.findOne({ where: { role: 'admin' } });

  const [customer] = await Customer.findOrCreate({
    where: { mobile: '9876543210' },
    defaults: {
      name: 'Ravi Sharma',
      mobile: '9876543210',
      email: 'ravi@sharmatraders.com',
      businessName: 'Sharma Traders',
      gstNumber: null,
      customerType: 'Wholesale',
      address: 'Sector 18, Noida',
      status: 'Active',
      followUpDate: new Date(),
      notes: 'High potential monthly buyer',
      createdBy: admin.id
    }
  });

  const followUpCount = await CustomerFollowUp.count({ where: { customerId: customer.id } });
  if (followUpCount === 0) {
    await CustomerFollowUp.bulkCreate([
      {
        customerId: customer.id,
        note: 'Shared updated wholesale price list and expected order timeline.',
        followUpDate: new Date(),
        createdBy: admin.id
      },
      {
        customerId: customer.id,
        note: 'Client asked for 7-day credit terms review.',
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdBy: admin.id
      }
    ]);
  }

  const [productA] = await Product.findOrCreate({
    where: { sku: 'SKU-BOLT-001' },
    defaults: {
      name: 'Industrial Bolt Pack',
      sku: 'SKU-BOLT-001',
      category: 'Fasteners',
      unitPrice: 240.00,
      currentStock: 180,
      minStockAlert: 30,
      warehouseLocation: 'A-1'
    }
  });

  const [productB] = await Product.findOrCreate({
    where: { sku: 'SKU-NUT-002' },
    defaults: {
      name: 'Hex Nut Box',
      sku: 'SKU-NUT-002',
      category: 'Fasteners',
      unitPrice: 130.00,
      currentStock: 260,
      minStockAlert: 40,
      warehouseLocation: 'A-2'
    }
  });

  const movementCount = await StockMovement.count();
  if (movementCount === 0) {
    await StockMovement.bulkCreate([
      {
        productId: productA.id,
        quantityChanged: 200,
        movementType: 'IN',
        reason: 'Initial stock onboarding',
        createdBy: admin.id
      },
      {
        productId: productA.id,
        quantityChanged: 20,
        movementType: 'OUT',
        reason: 'Sample dispatch',
        createdBy: admin.id
      },
      {
        productId: productB.id,
        quantityChanged: 300,
        movementType: 'IN',
        reason: 'Initial stock onboarding',
        createdBy: admin.id
      },
      {
        productId: productB.id,
        quantityChanged: 40,
        movementType: 'OUT',
        reason: 'Early customer dispatch',
        createdBy: admin.id
      }
    ]);
  }

  const existingChallan = await SalesChallan.findOne();
  if (!existingChallan) {
    const challanNumber = await generateChallanNo();
    const challan = await SalesChallan.create({
      challanNumber,
      customerId: customer.id,
      totalQuantity: 15,
      status: 'Draft',
      createdBy: admin.id
    });

    await ChallanItem.bulkCreate([
      {
        challanId: challan.id,
        productId: productA.id,
        productNameSnapshot: productA.name,
        productSkuSnapshot: productA.sku,
        unitPriceSnapshot: productA.unitPrice,
        quantity: 10
      },
      {
        challanId: challan.id,
        productId: productB.id,
        productNameSnapshot: productB.name,
        productSkuSnapshot: productB.sku,
        unitPriceSnapshot: productB.unitPrice,
        quantity: 5
      }
    ]);
  }
};

const run = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await seedData();
    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}

module.exports = {
  seedData
};
