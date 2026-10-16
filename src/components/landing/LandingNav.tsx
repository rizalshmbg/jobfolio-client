import { Link } from "react-router";
import Brand from "../common/Brand";
import { ArrowUpRight } from "lucide-react";

const LandingNav = () => {
  return (
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
  );
};
export default LandingNav;
