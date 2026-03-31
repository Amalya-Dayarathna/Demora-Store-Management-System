import { Link } from 'react-router-dom';

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="bg-white border-b border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src="/images/demora.png" 
            alt="Demora" 
            className="h-8 w-auto"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <h1 className="text-4xl font-bold text-black mb-2">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
    </div>
  );
}
