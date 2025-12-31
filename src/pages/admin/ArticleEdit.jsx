import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

const API_URL = import.meta.env.VITE_API_URL;

const ArticleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    tags: '',
    spotify_url: '',
    youtube_url: '',
    soundcloud_url: '',
    category: 'article',
    is_original: false,
    is_evergreen: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [additionalImage1, setAdditionalImage1] = useState(null);
  const [additionalImage2, setAdditionalImage2] = useState(null);
  const [additionalImage3, setAdditionalImage3] = useState(null);
  const [additionalPreview1, setAdditionalPreview1] = useState(null);
  const [additionalPreview2, setAdditionalPreview2] = useState(null);
  const [additionalPreview3, setAdditionalPreview3] = useState(null);
  const [existingAdditionalImage1, setExistingAdditionalImage1] = useState(null);
  const [existingAdditionalImage2, setExistingAdditionalImage2] = useState(null);
  const [existingAdditionalImage3, setExistingAdditionalImage3] = useState(null);

  // Markdown editor configuration
  const editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: 'Write your article content here... (Supports Markdown)',
    status: ['lines', 'words', 'cursor'],
    toolbar: [
      'bold', 'italic', 'heading', '|',
      'quote', 'unordered-list', 'ordered-list', '|',
      'link', 'image', '|',
      'preview', 'side-by-side', 'fullscreen', '|',
      'guide'
    ],
    autofocus: false,
    autosave: {
      enabled: true,
      uniqueId: `article-edit-${id}`,
      delay: 1000,
    },
  }), [id]);

  // Fetch article data when component mounts
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`${API_URL}/api/articles/${id}`);

        if (!response.ok) {
          throw new Error('Article not found');
        }

        const data = await response.json();
        const article = data.article;

        // Populate form with existing article data
        setFormData({
          title: article.title || '',
          author: article.author || '',
          content: article.content || '',
          tags: article.tags ? article.tags.join(', ') : '',
          spotify_url: article.spotify_url || '',
          youtube_url: article.youtube_url || '',
          soundcloud_url: article.soundcloud_url || '',
          category: article.category || 'article',
          is_original: article.is_original || false,
          is_evergreen: article.is_evergreen || false
        });

        // Set existing images if available
        if (article.image_url) {
          setExistingImageUrl(article.image_url);
          setImagePreview(article.image_url);
        }

        if (article.additional_image_1) {
          setExistingAdditionalImage1(article.additional_image_1);
          setAdditionalPreview1(article.additional_image_1);
        }

        if (article.additional_image_2) {
          setExistingAdditionalImage2(article.additional_image_2);
          setAdditionalPreview2(article.additional_image_2);
        }

        if (article.additional_image_3) {
          setExistingAdditionalImage3(article.additional_image_3);
          setAdditionalPreview3(article.additional_image_3);
        }
      } catch (err) {
        setError(err.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const updatedFormData = {
      ...formData,
      [e.target.name]: value
    };

    // Auto-check evergreen when "Guides" category is selected
    if (e.target.name === 'category' && value === 'guides') {
      updatedFormData.is_evergreen = true;
    }

    setFormData(updatedFormData);
    setError('');
  };

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

  const handleAdditionalImageChange = (e, imageNumber) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (imageNumber === 1) {
          setAdditionalImage1(file);
          setAdditionalPreview1(reader.result);
        } else if (imageNumber === 2) {
          setAdditionalImage2(file);
          setAdditionalPreview2(reader.result);
        } else if (imageNumber === 3) {
          setAdditionalImage3(file);
          setAdditionalPreview3(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        navigate('/admin/login');
        return;
      }

      // Process tags: convert comma-separated string to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Create FormData object to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('tags', JSON.stringify(tagsArray));

      // Add Spotify URL if provided
      if (formData.spotify_url) {
        formDataToSend.append('spotify_url', formData.spotify_url);
      }

      // Add YouTube URL if provided
      if (formData.youtube_url) {
        formDataToSend.append('youtube_url', formData.youtube_url);
      }

      // Add SoundCloud URL if provided
      if (formData.soundcloud_url) {
        formDataToSend.append('soundcloud_url', formData.soundcloud_url);
      }

      // Add category
      formDataToSend.append('category', formData.category);

      // Add is_original flag
      formDataToSend.append('is_original', formData.is_original);

      // Add is_evergreen flag
      formDataToSend.append('is_evergreen', formData.is_evergreen);

      // Append new cover image file if it exists
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      // Append additional images if they exist
      if (additionalImage1) {
        formDataToSend.append('additional_image_1', additionalImage1);
      }
      if (additionalImage2) {
        formDataToSend.append('additional_image_2', additionalImage2);
      }
      if (additionalImage3) {
        formDataToSend.append('additional_image_3', additionalImage3);
      }

      const response = await fetch(`${API_URL}/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type header - browser will set it with boundary for FormData
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update article');
      }

      // Redirect to articles list on success
      navigate('/admin/articles');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/articles');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading article...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Edit Article</h1>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                View Site
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Back to Articles
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter article title"
              />
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-300 mb-2">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter author name"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="article">Article</option>
                <option value="interview">Interview</option>
                <option value="guides">Guides</option>
              </select>
              <p className="mt-1 text-sm text-gray-400">Choose the article type (Guides = evergreen content)</p>
            </div>

            {/* 1of1 Original Toggle */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="is_original"
                  name="is_original"
                  type="checkbox"
                  checked={formData.is_original}
                  onChange={handleChange}
                  className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-gray-800"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="is_original" className="text-sm font-medium text-gray-300">
                  Mark as 1of1 Original
                </label>
                <p className="text-sm text-gray-400">
                  This article will appear in the "1of1 Originals" section instead of "Latest Stories"
                </p>
              </div>
            </div>

            {/* Evergreen Content Toggle */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="is_evergreen"
                  name="is_evergreen"
                  type="checkbox"
                  checked={formData.is_evergreen}
                  onChange={handleChange}
                  className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-gray-800"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="is_evergreen" className="text-sm font-medium text-gray-300">
                  Mark as Evergreen Content 🌲
                </label>
                <p className="text-sm text-gray-400">
                  Evergreen articles appear in the "Essential Guides" section and are optimized for SEO
                </p>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image {existingImageUrl && '(Optional - leave blank to keep current)'}
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">
                    {imageFile ? 'New Cover Image Preview:' : 'Current Cover Image:'}
                  </p>
                  <img
                    src={imagePreview}
                    alt="Cover Preview"
                    className="max-w-full h-auto max-h-64 rounded-md border border-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Additional Images */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">
                Additional Images (Up to 3)
                <span className="block text-xs text-gray-400 mt-1">These images will appear after the media embeds on the article page</span>
              </label>

              {/* Additional Image 1 */}
              <div>
                <label htmlFor="additional_image_1" className="block text-xs font-medium text-gray-400 mb-2">
                  Additional Image 1 {existingAdditionalImage1 && '(leave blank to keep current)'}
                </label>
                <input
                  type="file"
                  id="additional_image_1"
                  name="additional_image_1"
                  accept="image/*"
                  onChange={(e) => handleAdditionalImageChange(e, 1)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600/70 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                />
                {additionalPreview1 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">
                      {additionalImage1 ? 'New Image Preview:' : 'Current Image:'}
                    </p>
                    <img
                      src={additionalPreview1}
                      alt="Additional Preview 1"
                      className="max-w-full h-auto max-h-48 rounded-md border border-gray-600"
                    />
                  </div>
                )}
              </div>

              {/* Additional Image 2 */}
              <div>
                <label htmlFor="additional_image_2" className="block text-xs font-medium text-gray-400 mb-2">
                  Additional Image 2 {existingAdditionalImage2 && '(leave blank to keep current)'}
                </label>
                <input
                  type="file"
                  id="additional_image_2"
                  name="additional_image_2"
                  accept="image/*"
                  onChange={(e) => handleAdditionalImageChange(e, 2)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600/70 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                />
                {additionalPreview2 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">
                      {additionalImage2 ? 'New Image Preview:' : 'Current Image:'}
                    </p>
                    <img
                      src={additionalPreview2}
                      alt="Additional Preview 2"
                      className="max-w-full h-auto max-h-48 rounded-md border border-gray-600"
                    />
                  </div>
                )}
              </div>

              {/* Additional Image 3 */}
              <div>
                <label htmlFor="additional_image_3" className="block text-xs font-medium text-gray-400 mb-2">
                  Additional Image 3 {existingAdditionalImage3 && '(leave blank to keep current)'}
                </label>
                <input
                  type="file"
                  id="additional_image_3"
                  name="additional_image_3"
                  accept="image/*"
                  onChange={(e) => handleAdditionalImageChange(e, 3)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600/70 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                />
                {additionalPreview3 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">
                      {additionalImage3 ? 'New Image Preview:' : 'Current Image:'}
                    </p>
                    <img
                      src={additionalPreview3}
                      alt="Additional Preview 3"
                      className="max-w-full h-auto max-h-48 rounded-md border border-gray-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="hip-hop, trap, album-review (comma separated)"
              />
              <p className="mt-1 text-sm text-gray-400">Separate multiple tags with commas</p>
            </div>

            {/* Spotify URL */}
            <div>
              <label htmlFor="spotify_url" className="block text-sm font-medium text-gray-300 mb-2">
                Spotify Link (Optional)
              </label>
              <input
                type="url"
                id="spotify_url"
                name="spotify_url"
                value={formData.spotify_url}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://open.spotify.com/track/..."
              />
              <p className="mt-1 text-sm text-gray-400">Paste a Spotify track, album, or playlist URL</p>
            </div>

            {/* YouTube URL */}
            <div>
              <label htmlFor="youtube_url" className="block text-sm font-medium text-gray-300 mb-2">
                YouTube Link (Optional)
              </label>
              <input
                type="url"
                id="youtube_url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="mt-1 text-sm text-gray-400">Paste a YouTube video URL</p>
            </div>

            {/* SoundCloud URL */}
            <div>
              <label htmlFor="soundcloud_url" className="block text-sm font-medium text-gray-300 mb-2">
                SoundCloud Link (Optional)
              </label>
              <input
                type="url"
                id="soundcloud_url"
                name="soundcloud_url"
                value={formData.soundcloud_url}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://soundcloud.com/..."
              />
              <p className="mt-1 text-sm text-gray-400">Paste a SoundCloud track or playlist URL</p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                Content * (Markdown Supported)
              </label>
              <div className="markdown-editor-wrapper">
                <SimpleMDE
                  value={formData.content}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      content: value
                    });
                    setError('');
                  }}
                  options={editorOptions}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating...' : 'Update Article'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ArticleEdit;
