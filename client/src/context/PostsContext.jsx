import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { categoryService, postService } from '../services/api';

const PostsContext = createContext(null);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [currentPost, setCurrentPost] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data || response);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load categories';
      setError(message);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchPosts = useCallback(async (options = {}) => {
    setLoading(true);
    try {
      const { page = 1, limit = 10, category, search } = options;
      const response = await postService.getAllPosts(options);
      const { data, pagination: meta } = response;
      setPosts(data || []);
      if (meta) {
        setPagination(meta);
      } else {
        setPagination((prev) => ({
          ...prev,
          page: options.page ?? prev.page ?? 1,
          limit: options.limit ?? prev.limit ?? 10,
          totalPages: 1,
          total: data?.length || 0,
        }));
      }
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load posts';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPostById = useCallback(async (idOrSlug) => {
    setPostLoading(true);
    try {
      const response = await postService.getPost(idOrSlug);
      setCurrentPost(response.data || response);
      setError(null);
      return response.data || response;
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load post';
      setError(message);
      throw err;
    } finally {
      setPostLoading(false);
    }
  }, []);

  const createPost = useCallback(async (payload) => {
    setSaving(true);
    try {
      const response = await postService.createPost(payload);
      const createdPost = response.data || response;
      setPosts((prev) => [createdPost, ...prev]);
      setError(null);
      return createdPost;
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to create post';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updatePost = useCallback(async (id, payload) => {
    setSaving(true);
    try {
      const response = await postService.updatePost(id, payload);
      const updatedPost = response.data || response;
      setPosts((prev) => prev.map((post) => (post._id === id ? updatedPost : post)));
      setCurrentPost((prev) => (prev && prev._id === id ? updatedPost : prev));
      setError(null);
      return updatedPost;
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to update post';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const deletePost = useCallback(async (id) => {
    setSaving(true);
    try {
      await postService.deletePost(id);
      setPosts((prev) => prev.filter((post) => post._id !== id));
      if (currentPost && currentPost._id === id) {
        setCurrentPost(null);
      }
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to delete post';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [currentPost]);

  const addComment = useCallback(async (postId, payload) => {
    try {
      const response = await postService.addComment(postId, payload);
      const comment = response.data || response;
      setCurrentPost((prev) => {
        if (!prev || prev._id !== postId) return prev;
        return {
          ...prev,
          comments: [...(prev.comments || []), comment],
        };
      });
      setError(null);
      return comment;
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to add comment';
      setError(message);
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      posts,
      pagination,
      categories,
      loading,
      postLoading,
      saving,
      error,
      currentPost,
      fetchCategories,
      fetchPosts,
      fetchPostById,
      createPost,
      updatePost,
      deletePost,
      addComment,
      setError,
    }),
    [
      posts,
      pagination,
      categories,
      loading,
      postLoading,
      saving,
      error,
      currentPost,
      fetchCategories,
      fetchPosts,
      fetchPostById,
      createPost,
      updatePost,
      deletePost,
      addComment,
    ]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

PostsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const usePostsContext = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePostsContext must be used within a PostsProvider');
  }
  return context;
};

