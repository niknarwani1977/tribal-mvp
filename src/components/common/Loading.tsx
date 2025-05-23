import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto" />
        <p className="mt-4 text-neutral-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;