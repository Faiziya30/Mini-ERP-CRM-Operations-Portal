const { SalesChallan } = require('../models');
const { getLikeOp } = require('./dbHelpers');

const generateChallanNo = async (transaction) => {
  const currentYear = new Date().getFullYear();
  const prefix = `CH-${currentYear}-`;

  const lastChallan = await SalesChallan.findOne({
    where: {
      challanNumber: {
        [getLikeOp()]: `${prefix}%`
      }
    },
    order: [['id', 'DESC']],
    transaction
  });

  let nextNumber = 1;

  if (lastChallan) {
    const lastSerial = Number(lastChallan.challanNumber.split('-').pop());
    if (!Number.isNaN(lastSerial)) {
      nextNumber = lastSerial + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

module.exports = generateChallanNo;
