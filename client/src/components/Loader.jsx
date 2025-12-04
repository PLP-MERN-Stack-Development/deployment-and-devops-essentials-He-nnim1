const Loader = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" aria-hidden />
    <p className="text-gray-600 text-sm">{message}</p>
  </div>
);

export default Loader;

