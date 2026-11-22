const qrcode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a secure random pickup token
 */
const generatePickupToken = () => {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
};

/**
 * Generate QR code Data URL for customer pickup
 * The QR code contains an opaque payload: orderNumber, secure token, and shop identifier.
 * It contains NO personal identifiable information (PII).
 */
const generatePickupQRCode = async (orderNumber, pickupToken) => {
  const payload = JSON.stringify({
    orderNumber,
    token: pickupToken,
    shop: 'QuickPick',
    v: 1,
  });

  const dataUrl = await qrcode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 320,
    color: {
      dark: '#14532d', // Brand deep green
      light: '#ffffff',
    },
  });

  return dataUrl;
};

module.exports = {
  generatePickupToken,
  generatePickupQRCode,
};
