import type { ReactNode } from 'react';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';
import Brand from '@/components/Brand';

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthLayout({
  title,
  description,
  children,
}: Readonly<AuthLayoutProps>) {
  return (
    <div className='auth-layout'>
      <aside className='auth-story'>
        <Brand />
        <div className='auth-story-content'>
          <span className='eyebrow'>YOUR PERSONAL JOB APPLICATION TRACKER</span>
          <h2>
            Your next chapter.
            <br />
            <span>All in one place.</span>
          </h2>
          <p>
            Log your applications, track every stage, and see your job search
            progress with a little more clarity.
          </p>
          <div className='auth-opportunity'>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-2 text-sm font-medium'>
                <Sparkles size={17} />
                Your next opportunity
              </span>
              <ArrowUpRight size={20} />
            </div>
            <div className='auth-progress'>
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className='flex items-center justify-between text-xs'>
              <span>One step at a time</span>
              <span className='flex items-center gap-1.5'>
                <Check size={14} />
                You've got this
              </span>
            </div>
          </div>
        </div>
        <p className='text-xs text-white/60'>
          A little more organized. A little closer to what’s next.
        </p>
      </aside>
      <main className='auth-main'>
        <div className='mb-12 lg:hidden'>
          <Brand />
        </div>
        <div className='auth-form'>
          <span className='eyebrow text-primary'>YOUR CAREER, YOUR WAY</span>
          <h1>{title}</h1>
          <p className='mb-8 mt-3 text-sm leading-6 text-muted-foreground'>
            {description}
          </p>
          {children}
        </div>
        <p className='mt-12 text-center text-xs text-muted-foreground'>
          Made for your next move.
        </p>
      </main>
    </div>
  );
}
