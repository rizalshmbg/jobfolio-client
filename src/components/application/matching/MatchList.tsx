import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { MatchItem } from '@/types/jobs-matching';
import { Button } from '@components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion';
import { MatchListItem } from './MatchListItem';

type MatchListProps = {
  title: string;
  items: MatchItem[];
};

export function MatchList({ title, items }: Readonly<MatchListProps>) {
  const [showUnmatched, setShowUnmatched] = useState(false);

  const matchedItems = items.filter((item) => item.matched);
  const unmatchedItems = items.filter((item) => !item.matched);

  const visibleItems = showUnmatched
    ? [...matchedItems, ...unmatchedItems]
    : matchedItems;

  return (
    <Accordion>
      <AccordionItem value={title} className='border-b-0'>
        <AccordionTrigger className='py-2 hover:no-underline'>
          <div className='flex flex-1 flex-col items-start gap-1 text-left'>
            <span className='text-sm font-semibold'>{title}</span>
            <span className='text-xs text-muted-foreground'>
              {matchedItems.length} of {items.length} matched
            </span>
          </div>
        </AccordionTrigger>

        <AccordionContent className='pb-2'>
          {items.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No data.</p>
          ) : (
            <>
              {visibleItems.length > 0 ? (
                <div className='divide-y'>
                  {visibleItems.map((item, index) => (
                    <MatchListItem
                      key={`${title}-${index}`}
                      item={item}
                    />
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No matching items found.
                </p>
              )}

              {unmatchedItems.length > 0 && (
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  className='mt-3'
                  onClick={() =>
                    setShowUnmatched((previous) => !previous)
                  }
                >
                  {showUnmatched ? (
                    <>
                      <ChevronUp />
                      Hide unmatched requirements
                    </>
                  ) : (
                    <>
                      <ChevronDown />
                      Show unmatched requirements (
                      {unmatchedItems.length})
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
