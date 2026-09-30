import { CheckCircle2, CircleDot } from 'lucide-react';

import type { ApplicationActivity } from '@/types/application';
import { formatDate } from '@utils/format-date';
import { readable } from '@utils/format-label';
import { StatusBadge } from '@/components/common/StatusBadge';

type ApplicationActivityTimelineProps = {
  activities: ApplicationActivity[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function ApplicationActivityTimeline({
  activities,
  isLoading,
  isError,
  onRetry,
}: Readonly<ApplicationActivityTimelineProps>) {
  return (
    <section className='panel'>
      <div className='panel-heading'>
        <h2>Application activity status</h2>
      </div>

      {isLoading && (
        <p className='px-6 pb-6 text-sm text-muted-foreground'>
          Loading activity...
        </p>
      )}

      {isError && (
        <div className='px-6 pb-6'>
          <p className='text-sm text-muted-foreground'>
            Failed to load activity.
          </p>
          <button
            type='button'
            className='mt-2 text-sm font-medium text-primary hover:underline'
            onClick={onRetry}
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && activities.length === 0 && (
        <p className='px-6 pb-6 text-sm text-muted-foreground'>
          No activity yet.
        </p>
      )}

      {!isLoading && !isError && activities.length > 0 && (
        <div className='px-6 pb-6'>
          {activities.map((activity) => (
            <div
              key={activity.id}
              className='flex gap-3 border-b py-4 last:border-b-0'
            >
              <div className='pt-0.5 text-muted-foreground'>
                {activity.type === 'CREATED' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <CircleDot size={16} />
                )}
              </div>

              <div className='min-w-0 flex-1'>
                {activity.type === 'CREATED' ? (
                  <p className='text-sm'>
                    Application created
                    {activity.toStatus && (
                      <>
                        {' with status '}
                        <StatusBadge status={activity.toStatus} />
                      </>
                    )}
                  </p>
                ) : (
                  <p className='text-sm'>
                    Status changed
                    {activity.fromStatus && activity.toStatus && (
                      <>
                        {' from '}
                        <span className='font-medium'>
                          {readable(activity.fromStatus)}
                        </span>
                        {' to '}
                        <span className='font-medium'>
                          {readable(activity.toStatus)}
                        </span>
                      </>
                    )}
                  </p>
                )}

                <p className='mt-1 text-xs text-muted-foreground'>
                  {formatDate(activity.createdAt, true)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
