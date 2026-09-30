import { Plus } from 'lucide-react';
import { Link } from 'react-router';

export function AddApplicationLink() {
  return (
    <Link className='action-link' to='/applications/new'>
      <Plus size={17} />
      Add application
    </Link>
  );
}
