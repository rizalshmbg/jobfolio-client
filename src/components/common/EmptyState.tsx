import { BriefcaseBusiness } from 'lucide-react';
import { AddApplicationLink } from './AddApplicationLink';

export function EmptyState({
  filtered = false,
}: Readonly<{ filtered?: boolean }>) {
  return (
    <div className='empty-state'>
      <span className='empty-icon'>
        <BriefcaseBusiness size={25} />
      </span>
      <h3>
        {filtered
          ? 'No matching applications'
          : 'Your next chapter starts here'}
      </h3>
      <p>
        {filtered
          ? 'Try a different search or adjust your filters.'
          : 'Log your first application and start tracking your job search.'}
      </p>
      {!filtered && <AddApplicationLink />}
    </div>
  );
}
