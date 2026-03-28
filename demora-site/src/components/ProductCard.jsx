import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const isOutOfStock = product.totalStock === 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <Link to={`/product/${product.id}`}>
        <div className="relative bg-gray-100 h-64 overflow-hidden group">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.itemName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg text-black hover:text-gray-600 transition line-clamp-2">
            {product.itemName}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mt-1">
          {product.category?.categoryName}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-black">
            {formatPrice(product.sellingPrice)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2 rounded-lg transition ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        {product.totalStock > 0 && product.totalStock < 5 && (
          <p className="text-xs text-orange-600 mt-2 font-semibold">
            Only {product.totalStock} left
          </p>
        )}
      </div>
    </div>
  );
}
