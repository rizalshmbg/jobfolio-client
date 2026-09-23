import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { getApplicationById } from '@api/application.api';
import { formatDate } from '@utils/format-date';

const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const applicationQuery = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplicationById(id!),
    enabled: Boolean(id),
  });

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

      <Link to={`/applications/${id}/edit`}>Edit Application</Link>
    </main>
  );
};

export default ApplicationDetailPage;
