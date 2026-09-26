import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { UpdateApplicationInput } from '@/types/application';
import { Toaster } from '@/components/ui/sonner';
import { queryKeys } from '@lib/query-keys';
import EditApplicationPage from '@pages/EditApplicationPage';
import { application, applicationUrl, detailResponse, emptyOptionalFields, mockApplicationDetails } from '@/test/mocks/applications';
import { server } from '@/test/mocks/server';
import { applicationListKeys, deferredResponse, seedApplicationCaches } from '@/test/utils/application-tests';
import { renderWithProviders } from '@/test/utils/render-with-providers';

function renderEdit(withId = true) {
  const user = userEvent.setup();
  const result = renderWithProviders(
    <>
      <Routes>
        <Route path={withId ? '/applications/:id/edit' : '/invalid'} element={<EditApplicationPage />} />
        <Route path='/applications/:id' element={<h1>Application details</h1>} />
      </Routes>
      <Toaster />
    </>,
    { initialEntries: [withId ? `/applications/${application.id}/edit` : '/invalid'] },
  );
  return { user, ...result };
}

function mockUpdate() {
  const request = vi.fn(() => HttpResponse.json(detailResponse()));
  server.use(http.patch(applicationUrl, request));
  return request;
}

describe('EditApplicationPage', () => {
  it('shows loading and prefills every field from the requested application', async () => {
    const pending = deferredResponse();
    const detailRequest = vi.fn(async () => {
      await pending.promise;
      return HttpResponse.json(detailResponse());
    });
    server.use(http.get(applicationUrl, detailRequest));
    renderEdit();
    try {
      expect(screen.getByRole('status', { name: 'Loading page' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
      await waitFor(() => expect(detailRequest).toHaveBeenCalledTimes(1));
    } finally {
      pending.resolve();
      await screen.findByDisplayValue(application.company);
    }
    expect(screen.getByLabelText('Position')).toHaveValue(application.position);
    expect(screen.getByLabelText('Application status')).toHaveValue('INTERVIEW');
    expect(screen.getByLabelText(/Date applied/)).toHaveValue('2026-09-20');
    expect(screen.getByLabelText(/Job posting URL/)).toHaveValue(application.jobUrl);
    expect(screen.getByLabelText(/Location/)).toHaveValue(application.location);
    expect(screen.getByLabelText(/Employment type/)).toHaveValue('FULL_TIME');
    expect(screen.getByLabelText(/Work arrangement/)).toHaveValue('REMOTE');
    expect(screen.getByLabelText(/Minimum salary/)).toHaveValue(8000000);
    expect(screen.getByLabelText(/Maximum salary/)).toHaveValue(12000000);
    expect(screen.getByLabelText(/Notes/)).toHaveValue(application.notes);
  });

  it('renders nullable optional fields as empty controls', async () => {
    mockApplicationDetails(emptyOptionalFields);
    renderEdit();
    await screen.findByDisplayValue(application.company);
    for (const label of [/Date applied/, /Job posting URL/, /Location/, /Employment type/, /Work arrangement/, /Notes/]) {
      expect(screen.getByLabelText(label)).toHaveValue('');
    }
    expect(screen.getByLabelText(/Minimum salary/)).toHaveValue(null);
    expect(screen.getByLabelText(/Maximum salary/)).toHaveValue(null);
  });

  it('sends edited values to the correct ID and refreshes detail, list, and dashboard caches', async () => {
    let saved = application;
    const receivedBody = vi.fn();
    const detailRequest = vi.fn(() => HttpResponse.json(detailResponse(saved)));
    server.use(
      http.get(applicationUrl, detailRequest),
      http.patch(applicationUrl, async ({ request }) => {
        const body = await request.json() as UpdateApplicationInput;
        receivedBody(body);
        saved = { ...saved, ...body };
        return HttpResponse.json(detailResponse(saved));
      }),
    );
    const { user, queryClient } = renderEdit();
    seedApplicationCaches(queryClient);
    await screen.findByDisplayValue(application.company);
    await user.clear(screen.getByLabelText('Company'));
    await user.type(screen.getByLabelText('Company'), '  New company  ');
    await user.clear(screen.getByLabelText('Position'));
    await user.type(screen.getByLabelText('Position'), '  Senior Engineer  ');
    await user.selectOptions(screen.getByLabelText('Application status'), 'OFFER');
    await user.clear(screen.getByLabelText(/Minimum salary/));
    await user.type(screen.getByLabelText(/Minimum salary/), '0');
    await user.clear(screen.getByLabelText(/Notes/));
    await user.type(screen.getByLabelText(/Notes/), 'Offer received.');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('heading', { name: 'Application details' })).toBeVisible();
    expect(await screen.findByText('Application updated successfully.')).toBeVisible();
    expect(receivedBody).toHaveBeenCalledExactlyOnceWith({
      company: 'New company', position: 'Senior Engineer', status: 'OFFER',
      appliedAt: '2026-09-20', jobUrl: application.jobUrl, location: 'Jakarta',
      employmentType: 'FULL_TIME', workArrangement: 'REMOTE',
      salaryMin: 0, salaryMax: 12000000, notes: 'Offer received.',
    });
    expect(detailRequest).toHaveBeenCalledTimes(2);
    expect(queryClient.getQueryData(queryKeys.applications.detail(application.id))).toEqual(detailResponse(saved));
    for (const key of [...applicationListKeys, queryKeys.dashboard]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    }
  });

  it('sends explicit nulls when optional details are cleared', async () => {
    mockApplicationDetails();
    const receivedBody = vi.fn();
    server.use(http.patch(applicationUrl, async ({ request }) => {
      receivedBody(await request.json());
      return HttpResponse.json(detailResponse(emptyOptionalFields));
    }));
    const { user } = renderEdit();
    await screen.findByDisplayValue(application.company);
    fireEvent.change(screen.getByLabelText(/Date applied/), { target: { value: '' } });
    for (const label of [/Job posting URL/, /Location/, /Minimum salary/, /Maximum salary/, /Notes/]) {
      await user.clear(screen.getByLabelText(label));
    }
    await user.selectOptions(screen.getByLabelText(/Employment type/), '');
    await user.selectOptions(screen.getByLabelText(/Work arrangement/), '');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await screen.findByRole('heading', { name: 'Application details' });
    expect(receivedBody).toHaveBeenCalledExactlyOnceWith({
      company: application.company, position: application.position, status: 'INTERVIEW', ...emptyOptionalFields,
    });
  });

  it.each([
    { label: /^Company$/, value: '   ', message: 'Company is required' },
    { label: /Maximum salary/, value: '1', message: 'Maximum salary must be greater than or equal to minimum salary' },
  ])('validates edits before sending a request: $message', async ({ label, value, message }) => {
    mockApplicationDetails();
    const updateRequest = mockUpdate();
    const { user } = renderEdit();
    await screen.findByDisplayValue(application.company);
    const input = screen.getByLabelText(label);
    await user.clear(input);
    await user.type(input, value);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText(message)).toBeVisible();
    expect(input).toBeInvalid();
    expect(updateRequest).not.toHaveBeenCalled();
  });

  it.each([404, 500, 'network'] as const)('shows a %s loading error and allows retry', async (failure) => {
    const message = failure === 'network' ? 'Network Error' : 'Application unavailable';
    const detailRequest = vi.fn()
      .mockImplementationOnce(() => failure === 'network' ? HttpResponse.error() : HttpResponse.json({ message }, { status: failure }))
      .mockImplementation(() => HttpResponse.json(detailResponse()));
    server.use(http.get(applicationUrl, detailRequest));
    const { user } = renderEdit();
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByDisplayValue(application.company)).toBeVisible();
    expect(detailRequest).toHaveBeenCalledTimes(2);
  });

  it('rejects a missing route ID without fetching an application', () => {
    const detailRequest = vi.fn(() => HttpResponse.json(detailResponse()));
    server.use(http.get(`${import.meta.env.VITE_API_URL}/applications/:id`, detailRequest));
    renderEdit(false);
    expect(screen.getByRole('alert')).toHaveTextContent('This application link is invalid.');
    expect(detailRequest).not.toHaveBeenCalled();
  });

  it.each([500, 'network'] as const)('preserves edits and cached data after a %s save failure and allows retry', async (failure) => {
    mockApplicationDetails();
    const message = failure === 'network' ? 'Network Error' : 'Changes could not be saved';
    const updateRequest = vi.fn()
      .mockImplementationOnce(() => failure === 'network' ? HttpResponse.error() : HttpResponse.json({ message }, { status: failure }))
      .mockImplementation(() => HttpResponse.json(detailResponse()));
    server.use(http.patch(applicationUrl, updateRequest));
    const { user, queryClient } = renderEdit();
    seedApplicationCaches(queryClient);
    await screen.findByDisplayValue(application.company);
    await user.clear(screen.getByLabelText('Position'));
    await user.type(screen.getByLabelText('Position'), 'My revised position');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText(message)).toBeVisible();
    expect(screen.getByLabelText('Position')).toHaveValue('My revised position');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    expect(queryClient.getQueryData(queryKeys.applications.detail(application.id))).toEqual(detailResponse());
    for (const key of [...applicationListKeys, queryKeys.dashboard]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false);
    }
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByRole('heading', { name: 'Application details' })).toBeVisible();
    expect(updateRequest).toHaveBeenCalledTimes(2);
  });

  it('disables saving and prevents duplicate updates while pending', async () => {
    mockApplicationDetails();
    const pending = deferredResponse();
    const updateRequest = vi.fn(async () => {
      await pending.promise;
      return HttpResponse.json(detailResponse());
    });
    server.use(http.patch(applicationUrl, updateRequest));
    const { user } = renderEdit();
    await screen.findByDisplayValue(application.company);
    try {
      await user.click(screen.getByRole('button', { name: 'Save changes' }));
      const saving = await screen.findByRole('button', { name: 'Saving...' });
      expect(saving).toBeDisabled();
      await user.click(saving);
      await waitFor(() => expect(updateRequest).toHaveBeenCalledTimes(1));
    } finally {
      pending.resolve();
      await screen.findByRole('heading', { name: 'Application details' });
    }
    expect(await screen.findByRole('heading', { name: 'Application details' })).toBeVisible();
    expect(updateRequest).toHaveBeenCalledTimes(1);
  });

  it.each(['Cancel', 'Back to application'])('returns to the correct detail page through %s without saving', async (name) => {
    mockApplicationDetails();
    const updateRequest = mockUpdate();
    const { user } = renderEdit();
    await screen.findByDisplayValue(application.company);
    expect(screen.getByRole('link', { name })).toHaveAttribute('href', `/applications/${application.id}`);
    await user.click(screen.getByRole('link', { name }));
    expect(await screen.findByRole('heading', { name: 'Application details' })).toBeVisible();
    expect(updateRequest).not.toHaveBeenCalled();
  });
});
