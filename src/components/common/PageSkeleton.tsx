import { Skeleton } from '@/components/ui/skeleton';

export function PageSkeleton() {
  return (
    <output className='space-y-7' aria-label='Loading page'>
      <div className='space-y-3'>
        <Skeleton className='h-9 w-60' />
        <Skeleton className='h-4 w-72 max-w-full' />
      </div>
      <div className='grid grid-cols-2 gap-5 lg:grid-cols-4'>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className='h-32 rounded-xl' />
        ))}
      </div>
      <Skeleton className='h-80 rounded-xl' />
      <span className='sr-only'>Loading, please wait.</span>
    </output>
  );
}
