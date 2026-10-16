import { BriefcaseBusiness, Target, Workflow } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section id='features' className='features-section'>
      <div className='section-intro'>
        <span className='eyebrow text-primary'>LESS CHAOS. MORE CLARITY.</span>
        <h2>
          A calmer way to manage
          <br />
          your job search.
        </h2>
        <p>
          One personal workspace for your applications,
          <br className='hidden sm:block' /> your recruitment pipeline, and your
          progress.
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
  );
};
export default FeaturesSection;
