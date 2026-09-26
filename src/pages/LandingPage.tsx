import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CircleCheck,
  LayoutDashboard,
  MousePointer2,
  Sparkles,
  Target,
  User,
  Workflow,
} from 'lucide-react';
import { Link } from 'react-router';
import Brand from '@/components/Brand';
import { CompanyIcon, StatusBadge } from '@/components/workspace';

const previewApplications = [
  {
    company: 'Linear',
    position: 'Product Designer',
    status: 'INTERVIEW' as const,
    date: 'Sep 24',
  },
  {
    company: 'Notion',
    position: 'Frontend Developer',
    status: 'APPLIED' as const,
    date: 'Sep 22',
  },
  {
    company: 'Figma',
    position: 'Design Engineer',
    status: 'OFFER' as const,
    date: 'Sep 20',
  },
];

export default function LandingPage() {
  return (
    <div className='landing'>
      <header className='landing-nav'>
        <Brand />
        <nav
          aria-label='Main navigation'
          className='hidden items-center gap-8 text-sm text-muted-foreground sm:flex'
        >
          <a href='#features'>Features</a>
          <a href='#how-it-works'>How it works</a>
        </nav>
        <div className='flex items-center gap-5'>
          <Link to='/login' className='text-sm font-medium'>
            Log in
          </Link>
          <Link to='/register' className='action-link'>
            Get started
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <main>
        <section className='hero'>
          <div className='hero-badge'>
            <span />
            Your personal job application tracker
          </div>
          <h1>
            Big ambitions.
            <br />
            <span>Beautifully organized.</span>
          </h1>
          <p>
            Log every application. Track every stage. See your progress.
            <br className='hidden sm:block' /> Bring your entire job search
            together, all in one place.
          </p>
          <div className='hero-actions'>
            <Link to='/register' className='action-link'>
              Start tracking your applications
              <ArrowRight size={17} />
            </Link>
            <a href='#preview' className='action-link action-link-secondary'>
              Take a look
              <ArrowUpRight size={16} />
            </a>
          </div>
          <div className='hero-reassurance'>
            <span>
              <Check size={14} />
              Every application in one place
            </span>
            <span>
              <Check size={14} />
              Your progress, at a glance
            </span>
          </div>
        </section>
        <section
          id='preview'
          className='product-preview'
          aria-label='Example of the JobFolio dashboard'
        >
          <div className='preview-topbar'>
            <div className='flex gap-1.5'>
              <i />
              <i />
              <i />
            </div>
            <span>YOUR NEXT MOVE, IN VIEW</span>
            <span className='preview-label'>Product preview</span>
          </div>
          <div className='preview-layout'>
            <aside className='preview-sidebar'>
              <Brand />
              <div className='eyebrow mt-10 mb-4'>WORKSPACE</div>
              <div className='preview-nav active'>
                <LayoutDashboard size={16} />
                Overview
              </div>
              <div className='preview-nav'>
                <BriefcaseBusiness size={16} />
                Applications
              </div>
              <div className='preview-nav'>
                <User size={16} />
                My profile
              </div>
              <div className='preview-sidebar-bottom'>
                <span className='avatar'>Y</span>
                <div className='text-xs font-medium'>
                  Your workspace
                  <p className='mt-1 text-muted-foreground'>
                    A fresh perspective
                  </p>
                </div>
              </div>
            </aside>
            <div className='preview-main'>
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <span className='eyebrow'>LET'S MAKE THINGS HAPPEN</span>
                  <h2>
                    Your next chapter, in progress<span className='text-primary'>.</span>
                  </h2>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Every application is a step forward. Here's where you stand.
                  </p>
                </div>
                <span className='preview-add'>+ Add application</span>
              </div>
              <div className='preview-stats'>
                {[
                  {
                    label: 'Total applications',
                    value: '24',
                    detail: 'Opportunities explored',
                    icon: BriefcaseBusiness,
                  },
                  {
                    label: 'In progress',
                    value: '12',
                    detail: 'Moving through the pipeline',
                    icon: Workflow,
                  },
                  {
                    label: 'Interviews',
                    value: '05',
                    detail: 'Time to make an impression',
                    icon: Target,
                  },
                  {
                    label: 'Offers',
                    value: '02',
                    detail: 'Your hard work, paying off',
                    icon: Sparkles,
                  },
                ].map(({ label, value, detail, icon: Icon }) => (
                  <div key={label}>
                    <span className='flex items-center justify-between text-xs text-muted-foreground'>
                      {label}
                      <Icon size={15} />
                    </span>
                    <strong>{value}</strong>
                    <p>{detail}</p>
                  </div>
                ))}
              </div>
              <div className='preview-table'>
                <div className='flex items-center justify-between px-5 py-4'>
                  <h3 className='text-sm font-semibold'>Recent applications</h3>
                  <span className='text-xs text-primary'>View all ↗</span>
                </div>
                {previewApplications.map((app) => (
                  <div className='preview-row' key={app.company}>
                    <CompanyIcon company={app.company} />
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-xs font-semibold'>
                        {app.position}
                      </p>
                      <p className='mt-1 text-[11px] text-muted-foreground'>
                        {app.company}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                    <span className='hidden text-xs text-muted-foreground sm:block'>
                      {app.date}
                    </span>
                    <ArrowUpRight size={15} className='text-muted-foreground' />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='preview-floating'>
            <span className='flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700'>
              <CircleCheck size={21} />
            </span>
            <div>
              <strong className='text-xs'>A new chapter is calling</strong>
              <p className='mt-1 text-[11px] text-muted-foreground'>
                Make room for what’s next.
              </p>
            </div>
            <Sparkles size={18} className='text-primary' />
          </div>
        </section>
        <section id='features' className='features-section'>
          <div className='section-intro'>
            <span className='eyebrow text-primary'>
              LESS CHAOS. MORE CLARITY.
            </span>
            <h2>
              A calmer way to manage
              <br />
              your job search.
            </h2>
            <p>
              One personal workspace for your applications,
              <br className='hidden sm:block' /> your recruitment pipeline, and
              your progress.
            </p>
          </div>
          <div className='feature-grid'>
            {[
              {
                icon: BriefcaseBusiness,
                title: 'Every application, together',
                text: 'Log roles, companies, job links, and notes. Keep all the details of your applications in one place.',
              },
              {
                icon: Workflow,
                title: 'Every stage, in view',
                text: 'Track each application through the recruitment pipeline, from wishlist and applied to interview and offer.',
              },
              {
                icon: Target,
                title: 'Your progress, made clear',
                text: 'See your application totals and status breakdown at a glance. Understand where your job search stands.',
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <article key={title} className='feature-card'>
                <span className={`feature-icon feature-icon-${i}`}>
                  <Icon size={23} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id='how-it-works' className='how-section'>
          <div>
            <span className='eyebrow text-primary'>
              SMALL STEPS. NEW POSSIBILITIES.
            </span>
            <h2>
              From “what if”
              <br />
              to what’s next.
            </h2>
            <Link to='/register' className='text-link mt-6'>
              Find your starting point
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className='steps'>
            {[
              {
                title: 'Make it your space',
                text: 'Create an account for your personal application tracker.',
              },
              {
                title: 'Log your applications',
                text: 'Add the roles, companies, and details you want to keep track of.',
              },
              {
                title: 'Follow your progress',
                text: 'Update each status and see your job search take shape.',
              },
            ].map((step, i) => (
              <div className='step' key={step.title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className='landing-cta'>
          <MousePointer2 size={28} />
          <h2>
            Your next chapter starts
            <br />
            with a little clarity.
          </h2>
          <p>Give your job search a place to come together.</p>
          <Link to='/register' className='action-link'>
            Start your application tracker
            <ArrowRight size={17} />
          </Link>
        </section>
      </main>
      <footer className='landing-footer'>
        <Brand />
        <p>Made for your next move.</p>
        <span>© {new Date().getFullYear()} JobFolio</span>
      </footer>
    </div>
  );
}
