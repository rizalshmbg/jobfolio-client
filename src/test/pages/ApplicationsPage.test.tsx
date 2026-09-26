import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes, useParams } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Application, ApplicationsResponse } from '@/types/application';
import ApplicationsPage from '@pages/ApplicationsPage';
import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/utils/render-with-providers';

const applicationsUrl = `${import.meta.env.VITE_API_URL}/applications`;
const defaultParams = { page: '1', limit: '10', sortBy: 'createdAt', order: 'desc' };
const application: Application = {
  id: 'application-1',
  company: 'Acme',
  position: 'Frontend Engineer',
  status: 'APPLIED',
  appliedAt: '2026-09-20T12:00:00',
  jobUrl: 'https://example.com/jobs/1',
  location: 'Jakarta',
  employmentType: 'FULL_TIME',
  workArrangement: 'REMOTE',
  salaryMin: null,
  salaryMax: null,
  notes: null,
  createdAt: '2026-09-20T12:00:00Z',
  updatedAt: '2026-09-20T12:00:00Z',
  userId: 'user-1',
};
const wishlistApplication: Application = {
  ...application,
  id: 'application-2',
  company: 'Beta',
  position: 'Product Designer',
  status: 'WISHLIST',
  appliedAt: null,
  location: null,
  employmentType: null,
  workArrangement: null,
};
const applications = [application, wishlistApplication];

function listResponse(data = applications, page = 1, total = data.length): ApplicationsResponse {
  return {
    success: true,
    message: 'Applications retrieved',
    data,
    meta: { page, limit: 10, total, totalPages: Math.ceil(total / 10) },
  };
}

function mockApplications(resolve: (url: URL) => ApplicationsResponse = () => listResponse()) {
  const receivedParams = vi.fn();
  server.use(
    http.get(applicationsUrl, ({ request }) => {
      const url = new URL(request.url);
      receivedParams(Object.fromEntries(url.searchParams));
      return HttpResponse.json(resolve(url));
    }),
  );
  return receivedParams;
}

function DetailDestination() {
  const { id } = useParams();
  return <h1>Application details: {id}</h1>;
}

function renderApplicationsPage() {
  const user = userEvent.setup();
  renderWithProviders(
    <Routes>
      <Route path='/applications' element={<ApplicationsPage />} />
      <Route path='/applications/new' element={<h1>New application</h1>} />
      <Route path='/applications/:id' element={<DetailDestination />} />
    </Routes>,
    { initialEntries: ['/applications'] },
  );
  return user;
}

function deferredResponse() {
  let resolve!: () => void;
  const promise = new Promise<void>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

describe('ApplicationsPage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading, requests the default list, and renders application data and missing-field fallbacks', async () => {
    const pending = deferredResponse();
    const receivedParams = vi.fn();
    server.use(
      http.get(applicationsUrl, async ({ request }) => {
        receivedParams(Object.fromEntries(new URL(request.url).searchParams));
        await pending.promise;
        return HttpResponse.json(listResponse());
      }),
    );

    renderApplicationsPage();
    try {
      expect(screen.getByRole('status', { name: 'Loading page' })).toBeVisible();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Your next chapter starts here' })).not.toBeInTheDocument();
      await waitFor(() => expect(receivedParams).toHaveBeenCalledExactlyOnceWith(defaultParams));
    } finally {
      pending.resolve();
      await screen.findByRole('table');
    }

    expect(screen.queryByRole('status', { name: 'Loading page' })).not.toBeInTheDocument();
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent('Frontend Engineer');
    expect(rows[1]).toHaveTextContent('Acme · Jakarta');
    expect(rows[1]).toHaveTextContent('Applied');
    expect(rows[1]).toHaveTextContent('Full Time');
    expect(rows[1]).toHaveTextContent('Remote');
    expect(rows[1]).toHaveTextContent('20/09/2026');
    expect(rows[2]).toHaveTextContent('Product Designer');
    expect(rows[2]).toHaveTextContent('Wishlist');
    expect(rows[2]).toHaveTextContent('Not applied yet');
    expect(within(rows[2]).getAllByRole('cell', { name: '—' })).toHaveLength(2);
    expect(screen.getByText('Showing 1–2 of 2 applications')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('shows the first-application empty state and links to the creation page', async () => {
    mockApplications(() => listResponse([]));
    const user = renderApplicationsPage();

    expect(await screen.findByRole('heading', { name: 'Your next chapter starts here' })).toBeVisible();
    expect(screen.getByText('Log your first application and start tracking your job search.')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    await user.click(screen.getAllByRole('link', { name: 'Add application' })[1]);
    expect(await screen.findByRole('heading', { name: 'New application' })).toBeVisible();
  });

  it('shows a distinct empty state for filters with no matches and restores results when cleared', async () => {
    const receivedParams = mockApplications((url) =>
      listResponse(url.searchParams.has('status') ? [] : applications),
    );
    const user = renderApplicationsPage();
    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: 'Offers' }));

    expect(await screen.findByRole('heading', { name: 'No matching applications' })).toBeVisible();
    expect(screen.getByText('Try a different search or adjust your filters.')).toBeVisible();
    expect(receivedParams).toHaveBeenLastCalledWith({ ...defaultParams, status: 'OFFER' });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(await screen.findByRole('table')).toBeVisible();
    await waitFor(() => expect(receivedParams).toHaveBeenLastCalledWith(defaultParams));
    expect(screen.getByRole('button', { name: 'All applications' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it.each([
    { failure: 'HTTP 500', message: 'Applications are temporarily unavailable' },
    { failure: 'network failure', message: 'Network Error' },
  ])('displays $failure and reloads successfully using Try again', async ({ failure, message }) => {
    const listRequest = vi.fn()
      .mockImplementationOnce(() => failure === 'HTTP 500'
        ? HttpResponse.json({ success: false, message }, { status: 500 })
        : HttpResponse.error())
      .mockImplementation(() => HttpResponse.json(listResponse()));
    server.use(http.get(applicationsUrl, listRequest));
    const user = renderApplicationsPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
    expect(listRequest).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('table')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(listRequest).toHaveBeenCalledTimes(2);
  });

  it('debounces search for 500 ms and requests only the final search term', async () => {
    const receivedParams = mockApplications((url) =>
      listResponse(url.searchParams.has('search') ? [application] : applications),
    );
    renderApplicationsPage();
    await screen.findByRole('table');

    // Fake only the debounce period; use real timers for MSW and async UI queries.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      // Dispatch changes directly here to control their exact timing without
      // user-event's own timers interfering with the debounce clock.
      const search = screen.getByRole('searchbox', { name: 'Search company or position' });
      fireEvent.change(search, { target: { value: 'Ac' } });
      act(() => { vi.advanceTimersByTime(250); });
      fireEvent.change(search, { target: { value: 'Acme' } });
      act(() => { vi.advanceTimersByTime(499); });
      expect(receivedParams).toHaveBeenCalledExactlyOnceWith(defaultParams);
      act(() => { vi.advanceTimersByTime(1); });
    } finally {
      vi.useRealTimers();
    }

    await waitFor(() => expect(receivedParams).toHaveBeenLastCalledWith({ ...defaultParams, search: 'Acme' }));
    await waitFor(() => expect(screen.queryByText('Product Designer')).not.toBeInTheDocument());
    expect(screen.getByText('Frontend Engineer')).toBeVisible();
    expect(screen.getByText('Showing 1–1 of 1 applications')).toBeVisible();
    expect(receivedParams).toHaveBeenCalledTimes(2);
  });

  it('keeps status tabs and the status dropdown in sync and sends their selected values', async () => {
    const receivedParams = mockApplications();
    const user = renderApplicationsPage();
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Applied' }));
    await waitFor(() => expect(receivedParams).toHaveBeenLastCalledWith({ ...defaultParams, status: 'APPLIED' }));
    expect(screen.getByRole('combobox', { name: 'Application status' })).toHaveValue('APPLIED');
    expect(screen.getByRole('button', { name: 'Applied' })).toHaveAttribute('aria-pressed', 'true');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Application status' }), 'TECHNICAL_TEST');
    await waitFor(() => expect(receivedParams).toHaveBeenLastCalledWith({ ...defaultParams, status: 'TECHNICAL_TEST' }));
    expect(screen.getByRole('button', { name: 'Applied' })).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: 'All applications' }));
    await waitFor(() => expect(receivedParams).toHaveBeenLastCalledWith(defaultParams));
    expect(screen.getByRole('combobox', { name: 'Application status' })).toHaveValue('');
  });

  it('combines search, status, advanced filters, and sorting, then resets all controls and request parameters', async () => {
    const receivedParams = mockApplications();
    const user = renderApplicationsPage();
    await screen.findByRole('table');
    await user.type(screen.getByRole('searchbox'), 'Acme');
    await waitFor(() => expect(receivedParams).toHaveBeenLastCalledWith({ ...defaultParams, search: 'Acme' }));
    await user.click(screen.getByRole('button', { name: 'Applied' }));
    expect(screen.queryByRole('combobox', { name: 'Employment type' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByRole('button', { name: /^Filters/ })).toHaveAttribute('aria-expanded', 'true');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Employment type' }), 'FULL_TIME');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Work arrangement' }), 'REMOTE');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'company');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Order' }), 'asc');

    await waitFor(() => expect(receivedParams).toHaveBeenLastCalledWith({
      ...defaultParams,
      search: 'Acme',
      status: 'APPLIED',
      employmentType: 'FULL_TIME',
      workArrangement: 'REMOTE',
      sortBy: 'company',
      order: 'asc',
    }));
    expect(screen.getByRole('button', { name: /^Filters/ })).toHaveTextContent('2');
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    await waitFor(() => expect(receivedParams).toHaveBeenLastCalledWith(defaultParams));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Application status' })).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Employment type' })).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Work arrangement' })).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue('createdAt');
    expect(screen.getByRole('combobox', { name: 'Order' })).toHaveValue('desc');
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('keeps previous rows visible and disables pagination while loading the next page', async () => {
    const pending = deferredResponse();
    const receivedParams = vi.fn();
    const firstPage = Array.from({ length: 10 }, (_, index) => ({
      ...application, id: `application-${index + 1}`, position: `Engineer ${index + 1}`,
    }));
    server.use(
      http.get(applicationsUrl, async ({ request }) => {
        const url = new URL(request.url);
        receivedParams(Object.fromEntries(url.searchParams));
        if (url.searchParams.get('page') === '2') {
          await pending.promise;
          return HttpResponse.json(listResponse([wishlistApplication], 2, 11));
        }
        return HttpResponse.json(listResponse(firstPage, 1, 11));
      }),
    );
    const user = renderApplicationsPage();
    await screen.findByRole('table');
    expect(screen.getByText('Showing 1–10 of 11 applications')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    try {
      await user.click(screen.getByRole('button', { name: 'Next page' }));
      await waitFor(() => expect(receivedParams).toHaveBeenLastCalledWith({ ...defaultParams, page: '2' }));
      expect(screen.getByText('Engineer 1')).toBeVisible();
      expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(11);
      expect(screen.getByRole('table').closest('[aria-busy]')).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
      expect(screen.queryByRole('status', { name: 'Loading page' })).not.toBeInTheDocument();
    } finally {
      pending.resolve();
      await screen.findByText('Page 2 of 2');
    }

    expect(screen.getByText('Product Designer')).toBeVisible();
    expect(screen.queryByText('Engineer 1')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 11–11 of 11 applications')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(await screen.findByText('Page 1 of 2')).toBeVisible();
    await waitFor(() => expect(receivedParams).toHaveBeenLastCalledWith(defaultParams));
    expect(screen.getByText('Engineer 1')).toBeVisible();
  });

  it('resets pagination to the first page when changing a filter', async () => {
    const receivedParams = mockApplications((url) => listResponse(
      [application], Number(url.searchParams.get('page')), 11,
    ));
    const user = renderApplicationsPage();
    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await screen.findByText('Page 2 of 2');

    await user.click(screen.getByRole('button', { name: 'Applied' }));

    await waitFor(() => expect(receivedParams).toHaveBeenLastCalledWith({ ...defaultParams, status: 'APPLIED' }));
    expect(await screen.findByText('Page 1 of 2')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it.each([
    { link: 'company and role', name: /^Frontend Engineer\s*Acme · Jakarta$/ },
    { link: 'view application', name: 'View Frontend Engineer at Acme' },
  ])('opens the correct details route using the $link link', async ({ name }) => {
    mockApplications();
    const user = renderApplicationsPage();
    await screen.findByRole('table');

    await user.click(screen.getByRole('link', { name }));

    expect(await screen.findByRole('heading', { name: 'Application details: application-1' })).toBeVisible();
  });
});

