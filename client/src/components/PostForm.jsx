import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ErrorMessage from './ErrorMessage';

const defaultValues = {
  title: '',
  excerpt: '',
  category: '',
  content: '',
  tags: '',
  isPublished: true,
  featuredImage: null,
};

const PostForm = ({
  categories,
  initialValues,
  onSubmit,
  isSubmitting = false,
  error,
}) => {
  const [values, setValues] = useState({ ...defaultValues, ...initialValues });
  const [previewImage, setPreviewImage] = useState(initialValues?.featuredImage || null);

  useEffect(() => {
    setValues({ ...defaultValues, ...initialValues });
    setPreviewImage(initialValues?.featuredImage || null);
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (type === 'checkbox') {
      setValues((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const file = files?.[0] || null;
      setValues((prev) => ({ ...prev, featuredImage: file }));
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('excerpt', values.excerpt || '');
    formData.append('content', values.content);
    formData.append('category', values.category);
    formData.append('isPublished', values.isPublished);

    if (values.tags) {
      formData.append('tags', values.tags);
    }

    if (values.featuredImage instanceof File) {
      formData.append('featuredImage', values.featuredImage);
    }

    await onSubmit(formData);
  };

  return (
    <form className="bg-white rounded-lg shadow-md p-6 space-y-6" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          value={values.excerpt}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={values.category}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          value={values.content}
          onChange={handleChange}
          rows={10}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma separated)
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          value={values.tags}
          onChange={handleChange}
          placeholder="react, node, mongodb"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-2">
          Featured image
        </label>
        <input
          id="featuredImage"
          name="featuredImage"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        {previewImage && (
          <div className="mt-4">
            <img src={previewImage} alt="Preview" className="max-w-full h-auto rounded-lg shadow-md max-h-64" />
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="isPublished"
          name="isPublished"
          type="checkbox"
          checked={values.isPublished}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
          Publish immediately
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Post'}
        </button>
      </div>
    </form>
  );
};

PostForm.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    excerpt: PropTypes.string,
    category: PropTypes.string,
    content: PropTypes.string,
    tags: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    isPublished: PropTypes.bool,
    featuredImage: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
};

PostForm.defaultProps = {
  categories: [],
  initialValues: defaultValues,
  isSubmitting: false,
  error: null,
};

export default PostForm;

