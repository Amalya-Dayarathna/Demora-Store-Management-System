import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { formatPrice } from '../utils/currency';
import { CheckCircle, Copy } from 'lucide-react';

export default function OrderConfirmation() {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get order from location state or localStorage
    const orderData = location.state?.order || JSON.parse(localStorage.getItem('lastOrder'));
    if (orderData) {
      setOrder(orderData);
    }
  }, [location]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No order found</p>
          <Link to="/shop" className="text-black hover:text-gray-600 transition">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const bill = order.bill;
  const bankDetails = {
    accountName: 'Demora Store',
    accountNumber: '1234567890',
    bankName: 'Example Bank',
    routingNumber: '123456789',
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-black mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-8">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-xl font-bold text-black">{bill.billNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="text-xl font-bold text-black">
                {new Date(bill.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="border-t border-gray-300 pt-8 mb-8">
            <h2 className="text-lg font-bold text-black mb-4">Delivery Details</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">Name:</span> {bill.customerName}
              </p>
              <p>
                <span className="font-semibold">Phone:</span> {bill.customerPhone}
              </p>
              <p>
                <span className="font-semibold">Address:</span> {bill.customerAddress}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-gray-300 pt-8 mb-8">
            <h2 className="text-lg font-bold text-black mb-4">Order Items</h2>
            <div className="space-y-3">
              {bill.billItems.map((item, index) => (
                <div key={index} className="flex justify-between text-gray-700">
                  <span>
                    {item.item?.itemName || 'Product'} x {item.quantity}
                  </span>
                  <span className="font-semibold">
                    {formatPrice(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-300 pt-8 mb-8">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>{formatPrice(bill.subtotal)}</span>
              </div>
              {bill.codDelivery > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>COD Delivery</span>
                  <span>{formatPrice(bill.codDelivery)}</span>
                </div>
              )}
              {bill.packagingCost > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Packaging</span>
                  <span>{formatPrice(bill.packagingCost)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-300 pt-4 flex justify-between text-xl font-bold text-black">
              <span>Total</span>
              <span>{formatPrice(bill.grandTotal)}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="border-t border-gray-300 pt-8">
            <h2 className="text-lg font-bold text-black mb-4">Payment Method</h2>
            <p className="text-gray-700 mb-4">
              <span className="font-semibold">Method:</span> {bill.paymentType}
            </p>

            {bill.paymentType === 'Bank Transfer' && (
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Please transfer the amount to the following account:
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">Account Name</p>
                      <p className="font-semibold text-black">
                        {bankDetails.accountName}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.accountName)}
                      className="text-gray-600 hover:text-black transition"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">Account Number</p>
                      <p className="font-semibold text-black">
                        {bankDetails.accountNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.accountNumber)}
                      className="text-gray-600 hover:text-black transition"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">Bank Name</p>
                      <p className="font-semibold text-black">
                        {bankDetails.bankName}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.bankName)}
                      className="text-gray-600 hover:text-black transition"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                {copied && (
                  <p className="text-green-600 text-sm mt-4">Copied to clipboard!</p>
                )}
              </div>
            )}

            {bill.paymentType === 'COD' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  You will pay the amount upon delivery. Please keep this order number
                  for reference.
                </p>
              </div>
            )}
          </div>

          {/* Gift Details */}
          {order.giftDetails && (
            <div className="border-t border-gray-300 pt-8">
              <h2 className="text-lg font-bold text-black mb-4">Gift Details</h2>
              {order.giftDetails.senderName && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">From:</span>{' '}
                  {order.giftDetails.senderName}
                </p>
              )}
              {order.giftDetails.giftNote && (
                <p className="text-gray-700">
                  <span className="font-semibold">Message:</span>{' '}
                  {order.giftDetails.giftNote}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/shop"
            className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition text-center"
          >
            Continue Shopping
          </Link>
          <button
            onClick={() => window.print()}
            className="px-8 py-3 border border-black text-black rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Print Order
          </button>
        </div>
      </div>
    </div>
  );
}
