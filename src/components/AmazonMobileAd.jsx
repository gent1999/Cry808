import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function AmazonMobileAd({ className = '' }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMobileFeatured = async () => {
      try {
        const response = await fetch(`${API_URL}/api/amazon-products/mobile-featured`);
        if (!response.ok) {
          throw new Error('Failed to fetch mobile featured product');
        }
        const data = await response.json();
        setProduct(data.product);
      } catch (error) {
        console.error('Error fetching mobile featured Amazon product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMobileFeatured();
  }, []);

  if (loading || !product) {
    return null; // Don't show anything if loading or no product
  }

  return (
    <div className={className}>
      <div className="max-w-2xl mx-auto px-4">
        <a
          href={product.affiliate_link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all shadow-lg"
        >
          <div className="flex items-center gap-3 p-3">
            {/* Product Image */}
            {product.image_url && (
              <div className="w-16 h-16 flex-shrink-0 bg-white rounded-md overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">
                  Recommended
                </span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-xs text-white/70 line-clamp-1">
                  {product.description}
                </p>
              )}
              <p className="text-[10px] text-white/40 italic mt-1">
                Amazon Associate
              </p>
            </div>

            {/* Arrow Icon */}
            <svg
              className="w-5 h-5 text-orange-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  );
}
