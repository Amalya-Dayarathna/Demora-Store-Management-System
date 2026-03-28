export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatPrice = (price) => {
  return `$${parseFloat(price).toFixed(2)}`;
};
