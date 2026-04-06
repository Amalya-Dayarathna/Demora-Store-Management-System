import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [businessId, setBusinessId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get all businesses
        const businessesRes = await apiService.getBusinesses();
        const demora = businessesRes.data.find(
          (b) => b.name.toLowerCase() === 'demora'
        );

        if (!demora) {
          setError('Demora business not found');
          return;
        }

        setBusinessId(demora.id);

        // Get items for Demora
        const itemsRes = await apiService.getItems(demora.id);
        setProducts(itemsRes.data.slice(0, 6)); // Show first 6 products
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-black text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Welcome to DEMORA
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover our curated collection of premium products designed for modern living.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Shop Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600">
              Explore our latest collection
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No products available</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  View All Products
                  <ArrowRight size={20} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
