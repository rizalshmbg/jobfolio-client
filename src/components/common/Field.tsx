import type { ReactNode } from 'react';

export function Field({
  id,
  label,
  error,
  children,
  optional = false,
}: Readonly<{
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  optional?: boolean;
}>) {
  return (
    <div className='form-field'>
      <label htmlFor={id}>
        {label}
        {optional && (
          <span className='ml-1.5 font-normal text-muted-foreground'>
            (optional)
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className='field-error' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
}
