import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <section className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-12">
    <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
    <p className="text-xl text-gray-600 mb-8">The page you are looking for could not be found.</p>
    <Link
      to="/"
      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
    >
      Go back home
    </Link>
  </section>
);

export default NotFoundPage;

