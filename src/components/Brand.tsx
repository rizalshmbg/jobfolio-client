import { Layers2 } from 'lucide-react';
import { Link } from 'react-router';

export default function Brand({ compact = false }: Readonly<{ compact?: boolean }>) {
  return (
    <Link to='/' className='brand' aria-label='JobFolio home'>
      <span className='brand-mark'>
        <Layers2 size={21} strokeWidth={2.3} />
      </span>
      {!compact && (
        <span className='brand-name'>
          JobFolio<span className='text-primary'>.</span>
        </span>
      )}
    </Link>
  );
}
