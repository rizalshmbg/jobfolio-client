import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

export function ViewLink({
  to,
  children = 'View all',
}: Readonly<{
  to: string;
  children?: ReactNode;
}>) {
  return (
    <Link className='text-link' to={to}>
      {children}
      <ArrowUpRight size={15} />
    </Link>
  );
}
