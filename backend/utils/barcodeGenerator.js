// Generate EAN-13 compatible barcode (13 digits total)
function generateBarcode(prefix, sequence) {
  // Format: 2 digit prefix + 10 digit sequence = 12 digits + 1 check digit = 13 digits total
  const code = prefix.padStart(2, '0') + sequence.toString().padStart(10, '0');
  const checkDigit = calculateEAN13CheckDigit(code);
  return code + checkDigit.toString();
}

function calculateEAN13CheckDigit(code) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit;
}

function generateItemBarcode(businessId, itemId) {
  // Use timestamp (last 7 digits) + random (3 digits) for uniqueness = 10 digits
  const timestamp = Date.now().toString().slice(-7);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return generateBarcode('20', timestamp + random);
}

function generateVariantBarcode(businessId, variantId) {
  const timestamp = Date.now().toString().slice(-7);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return generateBarcode('30', timestamp + random);
}

module.exports = {
  generateItemBarcode,
  generateVariantBarcode,
  generateBarcode
};
