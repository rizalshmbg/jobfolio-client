import type { ReactNode } from 'react';

export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: Readonly<{
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}>) {
  return (
    <div className='page-heading'>
      <div>
        {eyebrow && <p className='eyebrow mb-2'>{eyebrow}</p>}
        <h1>{title}</h1>
        <p className='mt-2 text-sm text-muted-foreground'>{description}</p>
      </div>
      {children && (
        <div className='flex shrink-0 items-center gap-3'>{children}</div>
      )}
    </div>
  );
}
