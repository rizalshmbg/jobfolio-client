import Brand from '../common/Brand';

const LandingFooter = () => {
  return (
    <footer className='landing-footer'>
      <Brand />
      <p>
        Made for your next move. Built by{' '}
          <a
            href='https://github.com/rizalshmbg'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:underline text-primary'
          >
            Rizal Sihombing
          </a>
          <span>.</span>
      </p>
      <span>© {new Date().getFullYear()} JobFolio</span>
    </footer>
  );
};
export default LandingFooter;
