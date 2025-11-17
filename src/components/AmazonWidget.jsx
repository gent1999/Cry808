import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function AmazonWidget() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/amazon-products`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching Amazon products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
          🎧 Recommended Gear
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-white/50">Loading...</div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't show widget if no products
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
        🎧 Recommended Gear
      </h3>

      <div className="space-y-3">
        {products.map((item) => (
          <a
            key={item.id}
            href={item.affiliate_link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/50 rounded-lg transition-all group"
          >
            <div className="flex items-start gap-3">
              {/* Product Image */}
              {item.image_url && (
                <div className="w-20 h-20 flex-shrink-0 bg-white rounded-md overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors line-clamp-2">
                  {item.name}
                </h4>
                {item.description && (
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* External Link Icon */}
              <svg
                className="w-4 h-4 text-white/40 group-hover:text-green-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      <p className="text-xs text-white/40 mt-4 italic">
        As an Amazon Associate, we earn from qualifying purchases.
      </p>
    </div>
  );
}
