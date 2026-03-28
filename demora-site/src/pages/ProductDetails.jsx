import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const businessesRes = await apiService.getBusinesses();
        const demora = businessesRes.data.find(
          (b) => b.name.toLowerCase() === 'demora'
        );

        if (!demora) {
          setError('Demora business not found');
          return;
        }

        const itemsRes = await apiService.getItems(demora.id);
        const foundProduct = itemsRes.data.find((p) => p.id === id);

        if (!foundProduct) {
          setError('Product not found');
          return;
        }

        setProduct(foundProduct);
      } catch (err) {
        setError('Failed to load product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/shop')}
            className="text-black hover:text-gray-600 transition"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.totalStock === 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-black hover:text-gray-600 transition mb-8"
        >
          <ArrowLeft size={20} />
          Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div className="bg-gray-100 rounded-lg overflow-hidden h-96 md:h-full flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.itemName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">No Image Available</span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold text-black mb-4">
              {product.itemName}
            </h1>

            <p className="text-gray-600 mb-6">
              Category: {product.category?.categoryName}
            </p>

            <div className="mb-8">
              <p className="text-4xl font-bold text-black">
                {formatPrice(product.sellingPrice)}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-8">
              {isOutOfStock ? (
                <p className="text-red-600 font-semibold text-lg">Out of Stock</p>
              ) : product.totalStock < 5 ? (
                <p className="text-orange-600 font-semibold">
                  Only {product.totalStock} left in stock
                </p>
              ) : (
                <p className="text-green-600 font-semibold">In Stock</p>
              )}
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-black mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    −
                  </button>
                  <span className="text-xl font-semibold w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.totalStock, quantity + 1))
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <ShoppingCart size={24} />
              Add to Cart
            </button>

            {/* Product Description */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4">
                Product Details
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• SKU: {product.baseRefCode}</li>
                <li>• Category: {product.category?.categoryName}</li>
                <li>• Stock Available: {product.totalStock}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
