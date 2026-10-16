import Brand from "../common/Brand";

const LandingFooter = () => {
  return (
    <footer className='landing-footer'>
      <Brand />
      <p>Made for your next move.</p>
      <span>© {new Date().getFullYear()} JobFolio</span>
    </footer>
  );
};
export default LandingFooter;
