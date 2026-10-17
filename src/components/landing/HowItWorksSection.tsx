import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

const HowItWorksSection = () => {
  return (
    <section id='how-it-works' className='how-section'>
      <div>
        <span className='eyebrow text-primary'>
          SMALL STEPS. NEW POSSIBILITIES.
        </span>
        <h2>
          From “what if”
          <br />
          to what's next.
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
  );
};
export default HowItWorksSection;
