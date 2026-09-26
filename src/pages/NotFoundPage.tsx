import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import Brand from '@/components/Brand';

export default function NotFoundPage() {
  return (
    <main className='session-loading px-6 text-center'>
      <Brand />
      <span className='mt-5 text-7xl font-semibold tracking-tighter text-primary/40'>
        404
      </span>
      <h1 className='text-2xl font-semibold tracking-tight'>
        A little off the beaten path.
      </h1>
      <p className='max-w-sm text-sm leading-6 text-muted-foreground'>
        We couldn't find this page. Let's get you back to your next move.
      </p>
      <Link to='/' className='action-link'>
        <ArrowLeft size={16} />
        Back to home
      </Link>
    </main>
  );
}
