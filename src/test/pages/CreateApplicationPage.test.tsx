import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { Toaster } from '@/components/ui/sonner';
import { queryKeys } from '@lib/query-keys';
import CreateApplicationPage from '@pages/CreateApplicationPage';
import { applicationsUrl, detailResponse } from '@/test/mocks/applications';
import { server } from '@/test/mocks/server';
import { applicationListKeys, deferredResponse, seedApplicationCaches } from '@/test/utils/application-tests';
import { renderWithProviders } from '@/test/utils/render-with-providers';

function renderCreate() {
  const user = userEvent.setup();
  const result = renderWithProviders(
    <>
      <Routes>
        <Route path='/applications/new' element={<CreateApplicationPage />} />
        <Route path='/applications' element={<h1>Applications list</h1>} />
      </Routes>
      <Toaster />
    </>,
    { initialEntries: ['/applications/new'] },
  );
  return { user, ...result };
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Company'), '  Acme  ');
  await user.type(screen.getByLabelText('Position'), '  Frontend Engineer  ');
}

function mockCreate() {
  const request = vi.fn(() => HttpResponse.json(detailResponse(), { status: 201 }));
  server.use(http.post(applicationsUrl, request));
  return request;
}

describe('CreateApplicationPage', () => {
  it('sends trimmed required fields and the default status, omits blank optional fields, and invalidates list and dashboard caches', async () => {
    const receivedBody = vi.fn();
    server.use(http.post(applicationsUrl, async ({ request }) => {
      receivedBody(await request.json());
      return HttpResponse.json(detailResponse(), { status: 201 });
    }));
    const { user, queryClient } = renderCreate();
    seedApplicationCaches(queryClient);
    expect(screen.getByLabelText('Application status')).toHaveValue('APPLIED');
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Add application' }));

    expect(await screen.findByRole('heading', { name: 'Applications list' })).toBeVisible();
    expect(await screen.findByText('Application added successfully.')).toBeVisible();
    expect(receivedBody).toHaveBeenCalledExactlyOnceWith({ company: 'Acme', position: 'Frontend Engineer', status: 'APPLIED' });
    for (const key of [...applicationListKeys, queryKeys.dashboard]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    }
  });

  it('submits optional details with the selected status, date, and numeric salaries including zero', async () => {
    const receivedBody = vi.fn();
    server.use(http.post(applicationsUrl, async ({ request }) => {
      receivedBody(await request.json());
      return HttpResponse.json(detailResponse(), { status: 201 });
    }));
    const { user } = renderCreate();
    await fillRequired(user);
    await user.selectOptions(screen.getByLabelText('Application status'), 'OFFER');
    fireEvent.change(screen.getByLabelText(/Date applied/), { target: { value: '2026-09-22' } });
    await user.type(screen.getByLabelText(/Job posting URL/), 'https://example.com/job');
    await user.type(screen.getByLabelText(/Location/), 'Jakarta');
    await user.selectOptions(screen.getByLabelText(/Employment type/), 'CONTRACT');
    await user.selectOptions(screen.getByLabelText(/Work arrangement/), 'HYBRID');
    await user.type(screen.getByLabelText(/Minimum salary/), '0');
    await user.type(screen.getByLabelText(/Maximum salary/), '10000000');
    await user.type(screen.getByLabelText(/Notes/), 'Follow up next week.');
    await user.click(screen.getByRole('button', { name: 'Add application' }));

    await screen.findByRole('heading', { name: 'Applications list' });
    expect(receivedBody).toHaveBeenCalledExactlyOnceWith({
      company: 'Acme', position: 'Frontend Engineer', status: 'OFFER',
      appliedAt: '2026-09-22', jobUrl: 'https://example.com/job', location: 'Jakarta',
      employmentType: 'CONTRACT', workArrangement: 'HYBRID',
      salaryMin: 0, salaryMax: 10000000, notes: 'Follow up next week.',
    });
  });

  it.each(['empty', 'whitespace-only'])('rejects %s required fields without sending a request', async (value) => {
    const createRequest = mockCreate();
    const { user } = renderCreate();
    if (value === 'whitespace-only') {
      await user.type(screen.getByLabelText('Company'), '   ');
      await user.type(screen.getByLabelText('Position'), '   ');
    }
    await user.click(screen.getByRole('button', { name: 'Add application' }));
    expect(await screen.findByText('Company is required')).toBeVisible();
    expect(screen.getByText('Position is required')).toBeVisible();
    expect(screen.getByLabelText('Company')).toBeInvalid();
    expect(screen.getByLabelText('Position')).toHaveAccessibleDescription('Position is required');
    expect(createRequest).not.toHaveBeenCalled();
  });

  it.each([
    { label: /Job posting URL/, value: 'not-a-url', message: 'Please enter a valid URL' },
    { label: /Minimum salary/, value: '-1', message: 'Minimum salary must be a non-negative integer' },
    { label: /Maximum salary/, value: '1.5', message: 'Maximum salary must be a non-negative integer' },
    { label: /Maximum salary/, value: '5', minimum: '10', message: 'Maximum salary must be greater than or equal to minimum salary' },
    { label: /Notes/, value: 'N'.repeat(2001), message: 'Notes must be at most 2000 characters' },
    { label: /^Company$/, value: 'C'.repeat(101), message: 'Company must be at most 100 characters' },
  ])('prevents submission when validation reports "$message"', async ({ label, value, minimum, message }) => {
    const createRequest = mockCreate();
    const { user } = renderCreate();
    await fillRequired(user);
    const input = screen.getByLabelText(label);
    await user.clear(input);
    await user.click(input);
    // Pasting also covers long fields without thousands of synthetic keystrokes.
    await user.paste(value);
    if (minimum) await user.type(screen.getByLabelText(/Minimum salary/), minimum);
    await user.click(screen.getByRole('button', { name: 'Add application' }));
    expect(await screen.findByText(message)).toBeVisible();
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(message);
    expect(createRequest).not.toHaveBeenCalled();
  });

  it.each([500, 'network'] as const)('shows a %s create error, preserves the form and caches, and allows retry', async (failure) => {
    const message = failure === 'network' ? 'Network Error' : 'Unable to save this application';
    const createRequest = vi.fn()
      .mockImplementationOnce(() => failure === 'network' ? HttpResponse.error() : HttpResponse.json({ message }, { status: failure }))
      .mockImplementation(() => HttpResponse.json(detailResponse(), { status: 201 }));
    server.use(http.post(applicationsUrl, createRequest));
    const { user, queryClient } = renderCreate();
    seedApplicationCaches(queryClient);
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Add application' }));
    expect(await screen.findByText(message)).toBeVisible();
    expect(screen.getByLabelText('Company')).toHaveValue('  Acme  ');
    expect(screen.getByRole('button', { name: 'Add application' })).toBeEnabled();
    expect(screen.queryByRole('heading', { name: 'Applications list' })).not.toBeInTheDocument();
    for (const key of [...applicationListKeys, queryKeys.dashboard]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false);
    }
    await user.click(screen.getByRole('button', { name: 'Add application' }));
    expect(await screen.findByRole('heading', { name: 'Applications list' })).toBeVisible();
    expect(createRequest).toHaveBeenCalledTimes(2);
  });

  it('disables saving and prevents duplicate creates while the response is pending', async () => {
    const pending = deferredResponse();
    const createRequest = vi.fn(async () => {
      await pending.promise;
      return HttpResponse.json(detailResponse(), { status: 201 });
    });
    server.use(http.post(applicationsUrl, createRequest));
    const { user } = renderCreate();
    try {
      await fillRequired(user);
      await user.click(screen.getByRole('button', { name: 'Add application' }));
      const saving = await screen.findByRole('button', { name: 'Saving...' });
      expect(saving).toBeDisabled();
      await user.click(saving);
      await waitFor(() => expect(createRequest).toHaveBeenCalledTimes(1));
    } finally {
      pending.resolve();
      await screen.findByRole('heading', { name: 'Applications list' });
    }
    expect(await screen.findByRole('heading', { name: 'Applications list' })).toBeVisible();
    expect(createRequest).toHaveBeenCalledTimes(1);
  });

  it.each(['Cancel', 'Back to applications'])('returns to the list through %s without creating a record', async (name) => {
    const createRequest = mockCreate();
    const { user } = renderCreate();
    await fillRequired(user);
    await user.click(screen.getByRole('link', { name }));
    expect(await screen.findByRole('heading', { name: 'Applications list' })).toBeVisible();
    expect(createRequest).not.toHaveBeenCalled();
  });
});
