import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  const imageUrl = post.featuredImage ? `${post.featuredImage}` : null;
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {imageUrl && (
        <Link to={`/posts/${post.slug || post._id}`} className="block h-48 overflow-hidden">
          <img src={imageUrl} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        </Link>
      )}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            {post.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {post.category.name}
              </span>
            )}
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
          <Link to={`/posts/${post.slug || post._id}`}>{post.title}</Link>
        </h3>
        <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
          {post.excerpt || `${post.content.substring(0, 120)}...`}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>By {post.author?.name || 'Unknown author'}</span>
          <span>{post.viewCount || 0} views</span>
        </div>
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;

