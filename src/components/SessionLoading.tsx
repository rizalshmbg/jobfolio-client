import { LoaderCircle } from 'lucide-react';
import Brand from '@/components/Brand';

export default function SessionLoading() {
  return (
    <div className='session-loading'>
      <Brand />
      <output
        className='flex items-center gap-2 text-xs text-muted-foreground'
      >
        <LoaderCircle size={15} className='animate-spin' />
        Getting your workspace ready...
      </output>
    </div>
  );
}
