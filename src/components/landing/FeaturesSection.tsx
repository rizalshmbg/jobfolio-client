import {
  BriefcaseBusiness,
  ChartNoAxesCombined,
  FileCheck,
  NotebookPen,
  Search,
  Workflow,
} from 'lucide-react';

const features = [
  {
    icon: BriefcaseBusiness,
    title: 'Every application, together',
    text: 'Keep track of companies, positions, application statuses, job links, and important notes in one organized workspace.',
  },
  {
    icon: Search,
    title: 'Import job details, faster',
    text: 'Turn supported job posting URLs into organized application details and spend less time entering information manually.',
  },
  {
    icon: FileCheck,
    title: 'Make your CV work harder',
    text: 'Review your CV to discover potential improvements and better understand how it presents your skills and experience.',
  },
  {
    icon: Workflow,
    title: 'Every stage, in view',
    text: 'Follow your applications through each recruitment stage, from wishlist and applied to interviews and offers.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Your progress, made clear',
    text: 'Understand your job search at a glance with application totals and a breakdown of your application statuses.',
  },
  {
    icon: NotebookPen,
    title: 'Keep your career details ready',
    text: 'Store your CV in your profile so it is easy to access whenever you need it.',
  },
];

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
        {features.map(({ icon: Icon, title, text }, i) => (
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
