const CommentList = ({ comments }) => {
  if (!comments?.length) {
    return (
      <p className="text-gray-500 text-center py-6">No comments yet. Be the first to comment!</p>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li key={comment._id || comment.createdAt} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <strong className="text-gray-900 font-semibold">
              {comment.user?.name || 'Anonymous user'}
            </strong>
            <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-gray-700">{comment.content}</p>
        </li>
      ))}
    </ul>
  );
};

export default CommentList;

