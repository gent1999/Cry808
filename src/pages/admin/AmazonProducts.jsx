import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const AmazonProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    affiliate_link: '',
    is_active: true,
    display_order: 0,
    is_mobile_featured: false
  });

  useEffect(() => {
    const verifyAdminAndFetch = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/amazon-products/admin`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAndFetch();
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const url = editingProduct
        ? `${API_URL}/api/amazon-products/admin/${editingProduct.id}`
        : `${API_URL}/api/amazon-products/admin`;

      const method = editingProduct ? 'PUT' : 'POST';

      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('affiliate_link', formData.affiliate_link);
      formDataToSend.append('is_active', formData.is_active);
      formDataToSend.append('display_order', formData.display_order);
      formDataToSend.append('is_mobile_featured', formData.is_mobile_featured);

      // Append image file if it exists
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Don't set Content-Type header - browser will set it with boundary for FormData
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      // Refresh products list
      const productsResponse = await fetch(`${API_URL}/api/amazon-products/admin`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const productsData = await productsResponse.json();
      setProducts(productsData.products);

      // Close modal and reset form
      setShowModal(false);
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview(null);
      setFormData({
        name: '',
        description: '',
        affiliate_link: '',
        is_active: true,
        display_order: 0,
        is_mobile_featured: false
      });
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      affiliate_link: product.affiliate_link,
      is_active: product.is_active,
      display_order: product.display_order,
      is_mobile_featured: product.is_mobile_featured || false
    });
    // Set existing image as preview if available
    if (product.image_url) {
      setImagePreview(product.image_url);
    }
    setImageFile(null); // Clear any previous file selection
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/api/amazon-products/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Amazon Products</h1>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setImageFile(null);
                  setImagePreview(null);
                  setFormData({
                    name: '',
                    description: '',
                    affiliate_link: '',
                    is_active: true,
                    display_order: 0,
                    is_mobile_featured: false
                  });
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                + Add Product
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            No products yet. Add your first Amazon affiliate product!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
              >
                {product.image_url && (
                  <div className="h-48 bg-white flex items-center justify-center">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full object-contain"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs rounded ${
                        product.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {product.is_mobile_featured && (
                        <span className="px-2 py-1 text-xs rounded bg-orange-500/20 text-orange-400">
                          📱 Mobile Ad
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{product.description}</p>
                  <p className="text-xs text-gray-500 mb-3">Order: {product.display_order}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amazon Affiliate Link *
                </label>
                <input
                  type="url"
                  value={formData.affiliate_link}
                  onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://amzn.to/..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {imagePreview && (
                  <div className="mt-4 flex items-center justify-center bg-white rounded-lg p-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-40 object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Mobile Featured Toggle */}
              <div className="flex items-start border border-orange-500/30 rounded-lg p-4 bg-orange-500/5">
                <div className="flex items-center h-5">
                  <input
                    id="is_mobile_featured"
                    name="is_mobile_featured"
                    type="checkbox"
                    checked={formData.is_mobile_featured}
                    onChange={(e) => setFormData({ ...formData, is_mobile_featured: e.target.checked })}
                    className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-gray-800"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="is_mobile_featured" className="text-sm font-medium text-orange-400">
                    📱 Set as Mobile Homepage Ad
                  </label>
                  <p className="text-sm text-gray-400">
                    This product will replace the 300x50 banner on mobile devices. Only one product can be featured at a time.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmazonProducts;
