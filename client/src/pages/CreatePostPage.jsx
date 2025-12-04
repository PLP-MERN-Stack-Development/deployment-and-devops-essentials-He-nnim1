import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import PostForm from '../components/PostForm';
import ErrorMessage from '../components/ErrorMessage';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const {
    categories,
    createPost,
    saving,
    error,
    setError,
  } = usePosts();

  useEffect(() => {
    setError(null);
  }, [setError]);

  const handleSubmit = async (formData) => {
    try {
      const post = await createPost(formData);
      navigate(`/posts/${post.slug || post._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <header className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a new post</h1>
        <p className="text-gray-600">Craft engaging content and share it with the MERN community.</p>
      </header>
      <ErrorMessage message={error} />
      <PostForm
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={saving}
        error={error}
      />
    </section>
  );
};

export default CreatePostPage;

