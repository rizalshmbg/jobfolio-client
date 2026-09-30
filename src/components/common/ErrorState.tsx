import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ErrorState({
  message,
  retry,
}: Readonly<{
  message: string;
  retry?: () => void;
}>) {
  return (
    <div className='panel empty-state' role='alert'>
      <span className='empty-icon text-destructive'>
        <AlertCircle size={25} />
      </span>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {retry && (
        <Button variant='outline' onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
