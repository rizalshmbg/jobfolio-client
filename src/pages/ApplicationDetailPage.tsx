import { Link, useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getApplicationById, deleteApplication } from '@api/application.api';
import { formatDate } from '@utils/format-date';
import { queryKeys } from '@lib/query-keys';

const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const applicationQuery = useQuery({
    queryKey: queryKeys.applications.detail(id!),
    queryFn: () => getApplicationById(id!),
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(id!),
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: queryKeys.applications.detail(id!),
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.applications.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard,
        }),
      ]);

      navigate('/applications');
    },
  });

  const handleDelete = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this application?',
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate();
  };

  if (!id) {
    return <p>Invalid application ID.</p>;
  }

  if (applicationQuery.isPending) {
    return <p>Loading application...</p>;
  }

  if (applicationQuery.isError) {
    return <p>Failed to load application.</p>;
  }

  const application = applicationQuery.data.data;

  return (
    <main>
      {deleteMutation.isError && <p>Failed to delete application.</p>}

      <h1>{application.position}</h1>
      <p>Company: {application.company}</p>
      <p>Status: {application.status}</p>
      <p>Location: {application.location ?? '-'}</p>
      <p>Employment Type: {application.employmentType ?? '-'}</p>
      <p>Work Arrangement: {application.workArrangement ?? '-'}</p>
      <p>
        Applied At:{' '}
        {application.appliedAt ? formatDate(application.appliedAt) : '-'}
      </p>
      <a
        target='_blank'
        rel='noreferrer'
        href={application.jobUrl ? application.jobUrl : '-'}
      >
        Job Url
      </a>
      <p>Minimum Salary: {application.salaryMin ?? '-'}</p>
      <p>Maximum Salary: {application.salaryMax ?? '-'}</p>
      <p>Notes: {application.notes ?? '-'}</p>
      <p>Created: {formatDate(application.createdAt)}</p>
      <p>Updated: {formatDate(application.updatedAt)}</p>
      <button
        type='button'
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? 'Deleting...' : 'Delete Application'}
      </button>

      <Link to={`/applications/${id}/edit`}>Edit Application</Link>
    </main>
  );
};

export default ApplicationDetailPage;
