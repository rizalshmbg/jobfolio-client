import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export function BackLink({
  to = '/applications',
  children = 'Back to applications',
}: Readonly<{
  to?: string;
  children?: ReactNode;
}>) {
  return (
    <Link to={to} className='back-link'>
      <ArrowLeft size={15} />
      {children}
    </Link>
  );
}
