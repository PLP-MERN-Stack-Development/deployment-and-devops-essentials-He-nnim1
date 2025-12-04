import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import useAuth from '../hooks/useAuth';
import PostList from '../components/PostList';
import CategoryFilter from '../components/CategoryFilter';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const HomePage = () => {
  const {
    posts,
    pagination,
    categories,
    loading,
    error,
    fetchPosts,
  } = usePosts();
  const { isAuthenticated } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPosts({
      page,
      category: selectedCategory || undefined,
      search: searchTerm || undefined,
    });
  }, [fetchPosts, page, selectedCategory, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value || '');
    setPage(1);
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <section className="space-y-8">
      <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg text-white">
        <h1 className="text-4xl font-bold mb-4">MERN Blog</h1>
        <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
          Share your knowledge with the community. Create rich blog posts, manage categories,
          and discuss with fellow learners.
        </p>
        {isAuthenticated ? (
          <Link
            to="/posts/new"
            className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Write a post
          </Link>
        ) : (
          <Link
            to="/register"
            className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Join now
          </Link>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4 md:flex md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            id="search"
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search posts by title or content"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onChange={handleCategoryChange}
        />
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loader message="Fetching posts..." />
      ) : (
        <PostList posts={posts} />
      )}

      <div className="flex items-center justify-center space-x-4 bg-white p-4 rounded-lg shadow-md">
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={page <= 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-gray-700 font-medium">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          type="button"
          onClick={handleNextPage}
          disabled={page >= pagination.totalPages}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default HomePage;

