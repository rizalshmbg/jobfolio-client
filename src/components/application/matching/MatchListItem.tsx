import type { MatchItem } from '@/types/jobs-matching';

type MatchListItemProps = {
  item: MatchItem;
};

const relevanceStyles = {
  HIGH: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  MEDIUM:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  LOW: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
} as const;

export function MatchListItem({ item }: Readonly<MatchListItemProps>) {
  const relevance =
    item.relevance.toUpperCase() as keyof typeof relevanceStyles;

  const badgeStyle =
    relevanceStyles[relevance] ?? 'bg-muted text-muted-foreground';

  return (
    <div className='py-4 first:pt-0 last:pb-0'>
      <div className='flex items-center justify-between gap-4'>
        <p className='text-sm font-medium'>
          {item.matched ? 'Matched' : 'Not matched'}
        </p>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyle}`}
        >
          {item.relevance}
        </span>
      </div>

      {item.evidence.length > 0 ? (
        <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground'>
          {item.evidence.map((evidence, index) => (
            <li key={`${evidence}-${index}`}>{evidence}</li>
          ))}
        </ul>
      ) : (
        <p className='mt-2 text-sm text-muted-foreground'>
          No supporting evidence found in the resume.
        </p>
      )}
    </div>
  );
}
