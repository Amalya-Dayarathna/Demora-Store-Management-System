// Cost price code utility
const generateCostPriceCode = (price) => {
  const mapping = {
    '0': 'D', '1': 'E', '2': 'F', '3': 'G', '4': 'H',
    '5': 'I', '6': 'J', '7': 'K', '8': 'L', '9': 'M'
  };
  
  return price.toString().split('').map(digit => mapping[digit] || digit).join('');
};

module.exports = { generateCostPriceCode };