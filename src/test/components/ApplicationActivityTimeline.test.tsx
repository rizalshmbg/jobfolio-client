import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ApplicationActivity } from '@/types/application';
import { ApplicationActivityTimeline } from '@/components/application/ApplicationActivityTimeline';
import { formatDate } from '@utils/format-date';

const createdAt = '2026-09-28T08:30:00.000Z';

const createdActivity: ApplicationActivity = {
  id: 'activity-1',
  applicationId: 'application-1',
  type: 'CREATED',
  fromStatus: null,
  toStatus: 'APPLIED',
  createdAt,
};

const statusChangedActivity: ApplicationActivity = {
  id: 'activity-2',
  applicationId: 'application-1',
  type: 'STATUS_CHANGED',
  fromStatus: 'APPLIED',
  toStatus: 'INTERVIEW',
  createdAt: '2026-09-29T09:45:00.000Z',
};

function renderTimeline({
  activities = [],
  isLoading = false,
  isError = false,
  onRetry = vi.fn(),
}: Partial<React.ComponentProps<typeof ApplicationActivityTimeline>> = {}) {
  render(
    <ApplicationActivityTimeline
      activities={activities}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
    />,
  );

  return { onRetry };
}

describe('ApplicationActivityTimeline', () => {
  it('renders the activity heading in every state', () => {
    renderTimeline();

    expect(screen.getByRole('heading', { name: 'Application activity status' })).toBeVisible();
  });

  it('shows a loading message and hides activity content while loading', () => {
    renderTimeline({ activities: [createdActivity], isLoading: true });

    expect(screen.getByText('Loading activity...')).toBeVisible();
    expect(screen.queryByText('Application created')).not.toBeInTheDocument();
    expect(screen.queryByText('No activity yet.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('shows an error and invokes retry when Try again is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderTimeline({ activities: [createdActivity], isError: true, onRetry });

    expect(screen.getByText('Failed to load activity.')).toBeVisible();
    expect(screen.queryByText('Application created')).not.toBeInTheDocument();
    expect(screen.queryByText('No activity yet.')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state when activity has loaded without events', () => {
    renderTimeline();

    expect(screen.getByText('No activity yet.')).toBeVisible();
    expect(screen.queryByText('Loading activity...')).not.toBeInTheDocument();
    expect(screen.queryByText('Failed to load activity.')).not.toBeInTheDocument();
  });

  it('renders a creation event with its status badge and timestamp', () => {
    renderTimeline({ activities: [createdActivity] });

    const activity = screen.getByText(/^Application created/);
    expect(activity).toHaveTextContent('Application created with status Applied');
    expect(within(activity).getByText('Applied')).toHaveClass('status-badge');
    expect(activity.parentElement).toHaveTextContent(formatDate(createdAt, true));
  });

  it('renders a status change with human-readable statuses and its timestamp', () => {
    renderTimeline({ activities: [statusChangedActivity] });

    const activity = screen.getByText(/^Status changed/);
    expect(activity).toHaveTextContent('Status changed from Applied to Interview');
    expect(activity.parentElement).toHaveTextContent(
      formatDate(statusChangedActivity.createdAt, true),
    );
  });

  it.each([
    { activity: { ...createdActivity, toStatus: null }, message: 'Application created' },
    {
      activity: { ...statusChangedActivity, fromStatus: null },
      message: 'Status changed',
    },
    {
      activity: { ...statusChangedActivity, toStatus: null },
      message: 'Status changed',
    },
  ])('renders a safe summary when optional status data is missing', ({ activity, message }) => {
    renderTimeline({ activities: [activity] });

    const summary = screen.getByText(message);
    expect(summary).toBeVisible();
    expect(summary).not.toHaveTextContent('undefined');
    expect(summary).not.toHaveTextContent('null');
  });

  it('renders each event in the supplied order', () => {
    renderTimeline({ activities: [statusChangedActivity, createdActivity] });

    const summaries = screen
      .getAllByText(/^(Application created|Status changed)/)
      .map((element) => element.textContent);
    expect(summaries).toEqual([
      'Status changed from Applied to Interview',
      'Application created with status Applied',
    ]);
  });
});
