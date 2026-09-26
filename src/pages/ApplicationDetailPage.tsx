import { useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  FileText,
  Globe2,
  MapPin,
  Pencil,
  Trash2,
  Wallet,
} from 'lucide-react';
import { getApplicationById, deleteApplication } from '@api/application.api';
import { formatDate } from '@utils/format-date';
import { queryKeys } from '@lib/query-keys';
import { getApiErrorMessage } from '@utils/get-api-error.message';
import {
  BackLink,
  CompanyIcon,
  ErrorState,
  PageSkeleton,
  StatusBadge,
} from '@/components/workspace';
import { readable } from '@utils/format-label';
import { Button } from '@/components/ui/button';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(id!),
    onSuccess: async () => {
      deleteDialog.current?.close();
      queryClient.removeQueries({
        queryKey: queryKeys.applications.detail(id!),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.applications.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
      navigate('/applications');
      toast.success('Application deleted successfully.');
    },
    onError: (error) => {
      // Native modal dialogs cover the global toaster, so close it before feedback.
      deleteDialog.current?.close();
      toast.error(getApiErrorMessage(error, 'Failed to delete application.'));
    },
  });

  const applicationQuery = useQuery({
    queryKey: queryKeys.applications.detail(id!),
    queryFn: () => getApplicationById(id!),
    enabled:
      Boolean(id) && !deleteMutation.isPending && !deleteMutation.isSuccess,
  });

  if (!id) return <ErrorState message='This application link is invalid.' />;
  if (applicationQuery.isPending) return <PageSkeleton />;
  if (applicationQuery.isError)
    return (
      <ErrorState
        message={getApiErrorMessage(
          applicationQuery.error,
          'Failed to load application.',
        )}
        retry={() => void applicationQuery.refetch()}
      />
    );

  const application = applicationQuery.data.data;

  const jobUrl =
    application.jobUrl && /^https?:\/\//i.test(application.jobUrl)
      ? application.jobUrl
      : null;
  const properties = [
    {
      label: 'Location',
      value: application.location || 'Not specified',
      icon: MapPin,
    },
    {
      label: 'Employment type',
      value: readable(application.employmentType),
      icon: BriefcaseBusiness,
    },
    {
      label: 'Work arrangement',
      value: readable(application.workArrangement),
      icon: Globe2,
    },
    {
      label: 'Date applied',
      value: application.appliedAt
        ? formatDate(application.appliedAt)
        : 'Not applied yet',
      icon: CalendarDays,
    },
    {
      label: 'Minimum salary',
      value: application.salaryMin?.toLocaleString() ?? 'Not specified',
      icon: Wallet,
    },
    {
      label: 'Maximum salary',
      value: application.salaryMax?.toLocaleString() ?? 'Not specified',
      icon: Wallet,
    },
  ];

  return (
    <div className='form-page'>
      <BackLink />
      <div className='page-heading'>
        <div className='detail-title'>
          <CompanyIcon company={application.company} large />
          <div>
            <h1>{application.position}</h1>
            <p>{application.company}</p>
          </div>
        </div>
        <Link to={`/applications/${id}/edit`} className='action-link'>
          <Pencil size={15} />
          Edit application
        </Link>
      </div>
      <div className='detail-grid'>
        <div className='space-y-6'>
          <section className='panel'>
            <div className='panel-heading'>
              <h2>Application details</h2>
              <StatusBadge status={application.status} />
            </div>
            <dl className='detail-properties'>
              {properties.map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <dt>
                    <Icon size={14} />
                    {label}
                  </dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className='border-t px-6 py-4'>
              {jobUrl ? (
                <a
                  href={jobUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-link'
                >
                  View original job posting
                  <ArrowUpRight size={15} />
                </a>
              ) : (
                <p className='text-xs text-muted-foreground'>
                  No job posting link added.
                </p>
              )}
            </div>
          </section>
          <section className='panel'>
            <div className='panel-heading'>
              <h2 className='flex items-center gap-2'>
                <FileText size={16} className='text-primary' />
                Your notes
              </h2>
            </div>
            <p className='whitespace-pre-wrap wrap-anywhere px-6 pb-7 text-sm leading-7 text-muted-foreground'>
              {application.notes ||
                'A little space for interview notes, recruiter details, and anything else worth remembering. Add a note by editing this application.'}
            </p>
          </section>
        </div>
        <aside className='space-y-6'>
          <section className='panel'>
            <div className='panel-heading'>
              <div>
                <h2>At a glance</h2>
                <p>The latest on this opportunity.</p>
              </div>
            </div>
            <dl className='detail-timeline'>
              <div>
                <dt>
                  <BriefcaseBusiness size={14} />
                  Current stage
                </dt>
                <dd>
                  <StatusBadge status={application.status} />
                </dd>
              </div>
              <div>
                <dt>
                  <CalendarDays size={14} />
                  Added to your tracker
                </dt>
                <dd>{formatDate(application.createdAt)}</dd>
              </div>
              <div>
                <dt>
                  <Clock3 size={14} />
                  Last updated
                </dt>
                <dd>{formatDate(application.updatedAt)}</dd>
              </div>
            </dl>
          </section>
          <section className='rounded-xl border border-dashed border-border p-5'>
            <h2 className='text-xs font-medium'>Keep your tracker relevant</h2>
            <p className='mt-2 mb-4 text-xs leading-6 text-muted-foreground'>
              No longer need this record? You can remove it from your
              applications.
            </p>
            <Button
              variant='destructive'
              onClick={() => {
                deleteMutation.reset();
                deleteDialog.current?.showModal();
              }}
            >
              <Trash2 size={14} />
              Delete application
            </Button>
          </section>
        </aside>
      </div>
      <dialog
        ref={deleteDialog}
        className='delete-dialog'
        aria-labelledby='delete-title'
        aria-describedby='delete-description'
        onCancel={(event) => {
          if (deleteMutation.isPending) event.preventDefault();
        }}
      >
        <span className='mb-5 flex size-11 items-center justify-center rounded-xl bg-red-50 text-destructive'>
          <Trash2 size={21} />
        </span>
        <h2 id='delete-title' className='text-lg font-semibold tracking-tight'>
          Delete this application?
        </h2>
        <p
          id='delete-description'
          className='mt-3 mb-6 text-sm leading-6 text-muted-foreground'
        >
          This will permanently remove your application for{' '}
          <strong className='font-medium text-foreground'>
            {application.position}
          </strong>{' '}
          at {application.company}, including your notes.
        </p>
        <div className='flex justify-end gap-3'>
          <Button
            autoFocus
            variant='outline'
            disabled={deleteMutation.isPending}
            onClick={() => deleteDialog.current?.close()}
          >
            Keep application
          </Button>
          <Button
            variant='destructive'
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete application'}
          </Button>
        </div>
      </dialog>
    </div>
  );
}
