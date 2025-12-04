import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const DashboardPage = () => {
  const { user } = useAuth();
  const {
    posts,
    loading,
    error,
    fetchPosts,
    deletePost,
    saving,
  } = usePosts();

  useEffect(() => {
    if (user?._id) {
      fetchPosts({ author: user._id, limit: 20 });
    }
  }, [fetchPosts, user]);

  const handleDelete = async (postId) => {
    const confirmed = window.confirm('Delete this post?');
    if (!confirmed) return;
    await deletePost(postId);
  };

  return (
    <section className="space-y-6">
      <header className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your dashboard</h1>
        <p className="text-gray-600 mb-4">Manage your posts, edit published content, and review performance.</p>
        <Link
          to="/posts/new"
          className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          Create new post
        </Link>
      </header>

      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" aria-label="actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      You have not written any posts yet.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/posts/${post.slug || post._id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            post.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {post.viewCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          to={`/posts/${post._id}/edit`}
                          className="px-3 py-1 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="px-3 py-1 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleDelete(post._id)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default DashboardPage;

