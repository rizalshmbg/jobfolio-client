import { ArrowRight, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router';

const LandingCTA = () => {
  return (
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
  );
};
export default LandingCTA;
