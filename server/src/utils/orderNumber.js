const crypto = require('crypto');

/**
 * Generate a clean, human-readable unique order number
 * Format: QP-YYYYMMDD-XXXX (e.g. QP-20261121-8F3A)
 */
const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `QP-${dateStr}-${randomSuffix}`;
};

module.exports = {
  generateOrderNumber,
};
