import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import ApplicationDetailPage from '@pages/ApplicationDetailPage';
import { application, applicationUrl, detailResponse, emptyOptionalFields, mockApplicationDetails } from '@/test/mocks/applications';
import { server } from '@/test/mocks/server';
import { deferredResponse } from '@/test/utils/application-tests';
import { renderWithProviders } from '@/test/utils/render-with-providers';

function renderDetail(withId = true) {
  const user = userEvent.setup();
  renderWithProviders(
    <Routes>
      <Route path={withId ? '/applications/:id' : '/invalid'} element={<ApplicationDetailPage />} />
      <Route path='/applications' element={<h1>Applications list</h1>} />
      <Route path='/applications/:id/edit' element={<h1>Edit application</h1>} />
    </Routes>,
    { initialEntries: [withId ? `/applications/${application.id}` : '/invalid'] },
  );
  return user;
}

describe('ApplicationDetailPage', () => {
  it('loads the requested application and displays its details, dates, notes, and external posting link', async () => {
    const pending = deferredResponse();
    const detailRequest = vi.fn(async () => {
      await pending.promise;
      return HttpResponse.json(detailResponse());
    });
    server.use(http.get(applicationUrl, detailRequest));
    renderDetail();
    try {
      expect(screen.getByRole('status', { name: 'Loading page' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Delete application' })).not.toBeInTheDocument();
      await waitFor(() => expect(detailRequest).toHaveBeenCalledTimes(1));
    } finally {
      pending.resolve();
      await screen.findByRole('heading', { name: application.position });
    }

    expect(screen.getByText(application.company)).toBeVisible();
    for (const text of ['Jakarta', 'Full Time', 'Remote', '20/09/2026', '19/09/2026', '21/09/2026', application.notes!]) {
      expect(screen.getByText(text)).toBeVisible();
    }
    expect(screen.getAllByText('Interview')).toHaveLength(2);
    expect(screen.getByText((8000000).toLocaleString())).toBeVisible();
    expect(screen.getByText((12000000).toLocaleString())).toBeVisible();
    const posting = screen.getByRole('link', { name: 'View original job posting' });
    expect(posting).toHaveAttribute('href', application.jobUrl);
    expect(posting).toHaveAttribute('target', '_blank');
    expect(posting).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByRole('status', { name: 'Loading page' })).not.toBeInTheDocument();
  });

  it('renders fallbacks for missing optional details', async () => {
    mockApplicationDetails(emptyOptionalFields);
    renderDetail();
    await screen.findByRole('heading', { name: application.position });
    expect(screen.getAllByText('Not specified')).toHaveLength(5);
    expect(screen.getByText('Not applied yet')).toBeVisible();
    expect(screen.getByText('No job posting link added.')).toBeVisible();
    expect(screen.getByText(/Add a note by editing this application/)).toBeVisible();
    expect(screen.queryByRole('link', { name: 'View original job posting' })).not.toBeInTheDocument();
  });

  it.each(['javascript:alert(1)', 'data:text/html,example'])('does not create an external link for %s', async (jobUrl) => {
    mockApplicationDetails({ jobUrl });
    renderDetail();
    await screen.findByRole('heading', { name: application.position });
    expect(screen.queryByRole('link', { name: 'View original job posting' })).not.toBeInTheDocument();
    expect(screen.getByText('No job posting link added.')).toBeVisible();
  });

  it.each([404, 500, 'network'] as const)('shows a %s load error and retries successfully', async (failure) => {
    const message = failure === 'network' ? 'Network Error' : 'Application could not be loaded';
    const detailRequest = vi.fn()
      .mockImplementationOnce(() => failure === 'network' ? HttpResponse.error()
        : HttpResponse.json({ message }, { status: failure }))
      .mockImplementation(() => HttpResponse.json(detailResponse()));
    server.use(http.get(applicationUrl, detailRequest));
    const user = renderDetail();
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByRole('link', { name: 'Edit application' })).not.toBeInTheDocument();
    expect(detailRequest).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: application.position })).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(detailRequest).toHaveBeenCalledTimes(2);
  });

  it('rejects a missing route ID without requesting an application', () => {
    const detailRequest = vi.fn(() => HttpResponse.json(detailResponse()));
    server.use(http.get(`${import.meta.env.VITE_API_URL}/applications/:id`, detailRequest));
    renderDetail(false);
    expect(screen.getByRole('alert')).toHaveTextContent('This application link is invalid.');
    expect(detailRequest).not.toHaveBeenCalled();
  });

  it.each([
    { link: 'Back to applications', heading: 'Applications list', path: '/applications' },
    { link: 'Edit application', heading: 'Edit application', path: `/applications/${application.id}/edit` },
  ])('navigates using $link', async ({ link, heading, path }) => {
    mockApplicationDetails();
    const user = renderDetail();
    await screen.findByRole('heading', { name: application.position });
    expect(screen.getByRole('link', { name: link })).toHaveAttribute('href', path);
    await user.click(screen.getByRole('link', { name: link }));
    expect(await screen.findByRole('heading', { name: heading })).toBeVisible();
  });
});
