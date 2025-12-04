import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';

const PostDetailsPage = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();

  const {
    currentPost,
    postLoading,
    error,
    fetchPostById,
    deletePost,
    addComment,
    saving,
  } = usePosts();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPostById(idOrSlug);
  }, [fetchPostById, idOrSlug]);

  const canManagePost = currentPost && user && (user.role === 'admin' || currentPost.author?._id === user._id);

  const handleDelete = async () => {
    if (!currentPost) return;
    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    await deletePost(currentPost._id);
    navigate('/');
  };

  const handleAddComment = async (payload) => {
    if (!currentPost) return;
    await addComment(currentPost._id, payload);
  };

  if (postLoading || !currentPost) {
    return <Loader message="Loading post..." />;
  }

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      <ErrorMessage message={error} />
      <header className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentPost.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>By {currentPost.author?.name}</span>
              <span>{new Date(currentPost.createdAt).toLocaleDateString()}</span>
              {currentPost.category && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {currentPost.category.name}
                </span>
              )}
              <span>{currentPost.viewCount || 0} views</span>
            </div>
          </div>
          {canManagePost && (
            <div className="flex space-x-2 ml-4">
              <Link
                to={`/posts/${currentPost._id}/edit`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </header>

      {currentPost.featuredImage && (
        <div className="w-full h-96 overflow-hidden">
          <img
            src={currentPost.featuredImage}
            alt={currentPost.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 prose max-w-none">
        {currentPost.content.split('\n').map((paragraph, index) => (
          <p key={`paragraph-${index}`} className="mb-4 text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {currentPost.tags?.length > 0 && (
        <div className="px-6 pb-6 flex flex-wrap gap-2">
          {currentPost.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <section className="p-6 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>
        <CommentList comments={currentPost.comments} />

        {isAuthenticated ? (
          <div className="mt-6">
            <CommentForm onSubmit={handleAddComment} isSubmitting={saving} />
          </div>
        ) : (
          <p className="mt-6 text-gray-600">
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login
            </Link>{' '}
            to add a comment.
          </p>
        )}
      </section>
    </article>
  );
};

export default PostDetailsPage;

