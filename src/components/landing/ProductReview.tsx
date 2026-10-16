import { CircleCheck, Sparkles } from 'lucide-react';

const ProductReview = () => {
  return (
    <section
      id='preview'
      className='product-preview'
      aria-label='Example of the JobFolio dashboard'
    >
      <picture>
        <source
          media='(max-width: 767px)'
          srcSet='/images/landing/product-preview-mobile.webp'
        />

        <img
          src='/images/landing/product-preview-pc.webp'
          alt='Preview dashboard JobFolio'
          loading='lazy'
          decoding='async'
          className='w-full rounded-xl'
        />
      </picture>


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
  );
};
export default ProductReview;
