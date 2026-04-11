import { useNavigate } from 'react-router';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground/50 mb-6" />
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
        Page Not Found
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The recipe you&apos;re looking for doesn&apos;t exist. It may have been
        moved or removed.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
      >
        Back to Home
      </button>
    </div>
  );
}
