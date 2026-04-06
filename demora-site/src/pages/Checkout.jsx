import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiService } from '../services/api';
import { formatPrice } from '../utils/currency';
import { ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [businessId, setBusinessId] = useState(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    paymentType: 'COD',
    isGift: false,
    senderName: '',
    giftNote: '',
    codDelivery: 0,
    packagingCost: 0,
  });

  // Get business ID on mount
  useEffect(() => {
    const fetchBusinessId = async () => {
      try {
        const businessesRes = await apiService.getBusinesses();
        const demora = businessesRes.data.find(
          (b) => b.name.toLowerCase() === 'demora'
        );
        if (demora) {
          setBusinessId(demora.id);
        }
      } catch (err) {
        console.error('Failed to fetch business ID', err);
      }
    };
    fetchBusinessId();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      setError('Please fill in all required fields');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setLoading(true);

      // Get business ID if not already set
      let bid = businessId;
      if (!bid) {
        const businessesRes = await apiService.getBusinesses();
        const demora = businessesRes.data.find(
          (b) => b.name.toLowerCase() === 'demora'
        );
        bid = demora.id;
      }

      // Prepare bill items - send as item-based variants
      const billItems = cart.map((item) => ({
        variantId: `item-${item.id}`, // Virtual variant ID format expected by backend
        quantity: item.quantity,
      }));

      // Create bill
      const billData = {
        businessId: bid,
        items: billItems,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        paymentType: formData.paymentType,
        codDelivery: parseFloat(formData.codDelivery) || 0,
        packagingCost: parseFloat(formData.packagingCost) || 0,
      };

      console.log('Sending bill data:', billData);

      const response = await apiService.createBill(billData);

      // Store order details for confirmation page
      const orderData = {
        bill: response.data,
        giftDetails: formData.isGift
          ? {
              senderName: formData.senderName,
              giftNote: formData.giftNote,
            }
          : null,
      };

      localStorage.setItem('lastOrder', JSON.stringify(orderData));

      // Clear cart and navigate to confirmation
      clearCart();
      navigate('/order-confirmation', { state: { order: orderData } });
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-black hover:text-gray-600 transition mb-6 sm:mb-8"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </button>
          <p className="text-gray-600">Your cart is empty</p>
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const codDelivery = parseFloat(formData.codDelivery) || 0;
  const packagingCost = parseFloat(formData.packagingCost) || 0;
  const total = subtotal + codDelivery + packagingCost;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-black hover:text-gray-600 transition mb-6 sm:mb-8"
        >
          <ArrowLeft size={20} />
          Back to Cart
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-6 sm:mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Customer Details */}
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h2 className="text-xl font-bold text-black mb-4">
                  Delivery Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      name="customerAddress"
                      value={formData.customerAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional Costs */}
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h2 className="text-xl font-bold text-black mb-4">
                  Additional Costs
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      COD Delivery Charge
                    </label>
                    <input
                      type="number"
                      name="codDelivery"
                      value={formData.codDelivery}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Packaging Cost
                    </label>
                    <input
                      type="number"
                      name="packagingCost"
                      value={formData.packagingCost}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h2 className="text-xl font-bold text-black mb-4">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentType"
                      value="COD"
                      checked={formData.paymentType === 'COD'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-black">Cash on Delivery (COD)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentType"
                      value="Bank Transfer"
                      checked={formData.paymentType === 'Bank Transfer'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-black">Bank Transfer</span>
                  </label>
                </div>
              </div>

              {/* Gift Option */}
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="isGift"
                    checked={formData.isGift}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-black font-semibold">This is a gift</span>
                </label>

                {formData.isGift && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Sender Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="senderName"
                        value={formData.senderName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Gift Note (Optional)
                      </label>
                      <textarea
                        name="giftNote"
                        value={formData.giftNote}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 lg:sticky lg:top-20">
              <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.itemName} x {item.quantity}
                    </span>
                    <span className="text-black font-semibold">
                      {formatPrice(item.sellingPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6 border-t border-gray-300 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {codDelivery > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>COD Delivery</span>
                    <span>{formatPrice(codDelivery)}</span>
                  </div>
                )}
                {packagingCost > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Packaging</span>
                    <span>{formatPrice(packagingCost)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between text-lg font-bold text-black">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
