import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="h-16 w-16 text-warning-500 mx-auto" />
        </div>
        
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-neutral-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          to="/" 
          className="btn-primary inline-flex items-center"
        >
          <Home className="h-5 w-5 mr-2" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;