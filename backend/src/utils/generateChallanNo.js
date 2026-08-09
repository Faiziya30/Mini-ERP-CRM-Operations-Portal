const { SalesChallan } = require('../models');\r
const { getLikeOp } = require('./dbHelpers');\r
\r
const generateChallanNo = async (transaction) => {\r
  const currentYear = new Date().getFullYear();\r
  const prefix = `CH-${currentYear}-`;\r
\r
  const lastChallan = await SalesChallan.findOne({\r
    where: {\r
      challanNumber: {\r
        [getLikeOp()]: `${prefix}%`\r
      }\r
    },\r
    order: [['id', 'DESC']],\r
    transaction\r
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
