import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200">
      {/* Product Image */}
      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.itemName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <h3 className="font-semibold text-black">{item.itemName}</h3>
        <p className="text-sm text-gray-600">{item.category?.categoryName}</p>
        <p className="text-lg font-bold text-black mt-2">
          {formatPrice(item.sellingPrice)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <Minus size={18} />
        </button>
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Total & Remove */}
      <div className="flex flex-col items-end justify-between">
        <p className="font-bold text-black">
          {formatPrice(item.sellingPrice * item.quantity)}
        </p>
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-red-600 hover:text-red-800 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
