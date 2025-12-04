import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import Loader from '../components/Loader';
import PostForm from '../components/PostForm';
import ErrorMessage from '../components/ErrorMessage';

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentPost,
    categories,
    fetchPostById,
    updatePost,
    postLoading,
    saving,
    error,
    setError,
  } = usePosts();

  useEffect(() => {
    setError(null);
    fetchPostById(id);
  }, [fetchPostById, id, setError]);

  const initialValues = useMemo(() => {
    if (!currentPost) return null;
    return {
      title: currentPost.title,
      excerpt: currentPost.excerpt || '',
      category: currentPost.category?._id || '',
      content: currentPost.content,
      tags: currentPost.tags?.join(', ') || '',
      isPublished: currentPost.isPublished,
      featuredImage: currentPost.featuredImage || null,
    };
  }, [currentPost]);

  const handleSubmit = async (formData) => {
    try {
      const post = await updatePost(id, formData);
      navigate(`/posts/${post.slug || post._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (postLoading || !initialValues) {
    return <Loader message="Loading post data..." />;
  }

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <header className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit post</h1>
        <p className="text-gray-600">Update your content and keep readers engaged.</p>
      </header>
      <ErrorMessage message={error} />
      <PostForm
        categories={categories}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isSubmitting={saving}
        error={error}
      />
    </section>
  );
};

export default EditPostPage;

