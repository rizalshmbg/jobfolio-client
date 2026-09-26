import type { ReactNode } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ApplicationStatus } from '@/types/application';
import { readable } from '@utils/format-label';

export function StatusBadge({
  status,
}: Readonly<{ status: ApplicationStatus }>) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span />
      {readable(status)}
    </span>
  );
}

export function CompanyIcon({
  company,
  large = false,
}: Readonly<{
  company: string;
  large?: boolean;
}>) {
  const color =
    Array.from(company).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
  return (
    <span
      aria-hidden='true'
      className={`company-icon company-color-${color} ${large ? 'company-icon-large' : ''}`}
    >
      {company.trim().slice(0, 1).toUpperCase()}
    </span>
  );
}

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

export function AddApplicationLink() {
  return (
    <Link className='action-link' to='/applications/new'>
      <Plus size={17} />
      Add application
    </Link>
  );
}

export function BackLink({
  to = '/applications',
  children = 'Back to applications',
}: Readonly<{
  to?: string;
  children?: ReactNode;
}>) {
  return (
    <Link to={to} className='back-link'>
      <ArrowLeft size={15} />
      {children}
    </Link>
  );
}

export function EmptyState({
  filtered = false,
}: Readonly<{ filtered?: boolean }>) {
  return (
    <div className='empty-state'>
      <span className='empty-icon'>
        <BriefcaseBusiness size={25} />
      </span>
      <h3>
        {filtered
          ? 'No matching applications'
          : 'Your next chapter starts here'}
      </h3>
      <p>
        {filtered
          ? 'Try a different search or adjust your filters.'
          : 'Log your first application and start tracking your job search.'}
      </p>
      {!filtered && <AddApplicationLink />}
    </div>
  );
}

export function ErrorState({
  message,
  retry,
}: Readonly<{
  message: string;
  retry?: () => void;
}>) {
  return (
    <div className='panel empty-state' role='alert'>
      <span className='empty-icon text-destructive'>
        <AlertCircle size={25} />
      </span>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {retry && (
        <Button variant='outline' onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <output className='space-y-7' aria-label='Loading page'>
      <div className='space-y-3'>
        <Skeleton className='h-9 w-60' />
        <Skeleton className='h-4 w-72 max-w-full' />
      </div>
      <div className='grid grid-cols-2 gap-5 lg:grid-cols-4'>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className='h-32 rounded-xl' />
        ))}
      </div>
      <Skeleton className='h-80 rounded-xl' />
      <span className='sr-only'>Loading, please wait.</span>
    </output>
  );
}

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

export function ViewLink({
  to,
  children = 'View all',
}: Readonly<{
  to: string;
  children?: ReactNode;
}>) {
  return (
    <Link className='text-link' to={to}>
      {children}
      <ArrowUpRight size={15} />
    </Link>
  );
}
