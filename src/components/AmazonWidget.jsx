import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function AmazonWidget({ page = 'home' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/amazon-products?page=${page}`);
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
  }, [page]);

  if (loading) {
    return null;
  }

  if (products.length === 0) {
    return null; // Don't show widget if no products
  }

  return (
    <div className="space-y-3">
      {products.map((item) => (
        <a
          key={item.id}
          href={item.affiliate_link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block hover:opacity-90 transition-opacity"
        >
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-auto"
            />
          )}
        </a>
      ))}
    </div>
  );
}
