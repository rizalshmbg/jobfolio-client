import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      theme='light'
      position='top-right'
      richColors
      closeButton
      duration={5000}
      toastOptions={{
        style: {
          fontFamily: 'var(--font-sans)',
          borderRadius: 'var(--radius)',
        },
      }}
    />
  );
}
