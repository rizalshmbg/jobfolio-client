import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router';

const HeroSection = () => {
  return (
    <section className='hero'>
      <div className='hero-badge'>
        <span className='circle'></span>
        <p>Your personal job application tracker</p>
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
  );
};
export default HeroSection;
