import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function Navbar() {
  const { getTotalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/images/demorawhite.png" 
              alt="Demora" 
              className="h-8 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="text-2xl font-bold tracking-tight">DEMORA</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            <Link to="/" className="hover:text-gray-300 transition">
              Home
            </Link>
            <Link to="/shop" className="hover:text-gray-300 transition">
              Shop
            </Link>
          </div>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 hover:text-gray-300 transition"
          >
            <ShoppingCart size={24} />
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {getTotalItems()}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              className="block hover:text-gray-300 transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="block hover:text-gray-300 transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Shop
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
