import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { Toaster } from '@/components/ui/sonner';
import { queryKeys } from '@lib/query-keys';
import ApplicationDetailPage from '@pages/ApplicationDetailPage';
import { application, applicationUrl, detailResponse, mockApplicationDetails } from '@/test/mocks/applications';
import { server } from '@/test/mocks/server';
import { applicationListKeys, deferredResponse, seedApplicationCaches } from '@/test/utils/application-tests';
import { renderWithProviders } from '@/test/utils/render-with-providers';

function renderDetail() {
  const user = userEvent.setup();
  const result = renderWithProviders(
    <>
      <Routes>
        <Route path='/applications/:id' element={<ApplicationDetailPage />} />
        <Route path='/applications' element={<h1>Applications list</h1>} />
      </Routes>
      <Toaster />
    </>,
    { initialEntries: [`/applications/${application.id}`] },
  );
  return { user, ...result };
}

async function openDelete(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('heading', { name: application.position });
  await user.click(screen.getByRole('button', { name: 'Delete application' }));
  return screen.getByRole('dialog', { name: 'Delete this application?' });
}

describe('Delete application', () => {
  const dialogPrototype = HTMLDialogElement.prototype;
  const originalShowModal = Object.getOwnPropertyDescriptor(dialogPrototype, 'showModal');
  const originalClose = Object.getOwnPropertyDescriptor(dialogPrototype, 'close');

  beforeAll(() => {
    // jsdom lacks these native methods. Model open/close for the real dialog
    // and its React handlers; browser focus trapping is outside these tests.
    Object.defineProperty(dialogPrototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) { this.open = true; },
    });
    Object.defineProperty(dialogPrototype, 'close', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = false;
        this.dispatchEvent(new Event('close'));
      },
    });
  });

  afterAll(() => {
    if (originalShowModal) Object.defineProperty(dialogPrototype, 'showModal', originalShowModal);
    else Reflect.deleteProperty(dialogPrototype, 'showModal');
    if (originalClose) Object.defineProperty(dialogPrototype, 'close', originalClose);
    else Reflect.deleteProperty(dialogPrototype, 'close');
  });

  it('requires confirmation and closes Keep application without deleting or changing cached data', async () => {
    mockApplicationDetails();
    const deleteRequest = vi.fn(() => HttpResponse.json({ success: true }));
    server.use(http.delete(applicationUrl, deleteRequest));
    const { user, queryClient } = renderDetail();
    seedApplicationCaches(queryClient);
    const dialog = await openDelete(user);
    expect(dialog).toHaveAccessibleDescription(/permanently remove your application for Frontend Engineer at Acme/);
    expect(deleteRequest).not.toHaveBeenCalled();
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(dialog, cancel);
    expect(cancel.defaultPrevented).toBe(false);

    await user.click(within(dialog).getByRole('button', { name: 'Keep application' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: application.position })).toBeVisible();
    expect(deleteRequest).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(queryKeys.applications.detail(application.id))).toEqual(detailResponse());
    for (const key of [...applicationListKeys, queryKeys.dashboard]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false);
    }
  });

  it.each([200, 204])('deletes the correct ID on HTTP %s, removes its cached detail, and invalidates collections', async (status) => {
    const detailRequest = mockApplicationDetails();
    const deleteRequest = vi.fn(() => status === 204 ? new HttpResponse(null, { status })
      : HttpResponse.json({ success: true, message: 'Application deleted' }));
    server.use(http.delete(applicationUrl, deleteRequest));
    const { user, queryClient } = renderDetail();
    seedApplicationCaches(queryClient);
    const otherDetailKey = queryKeys.applications.detail('other-application');
    const otherDetail = detailResponse({ id: 'other-application' });
    queryClient.setQueryData(otherDetailKey, otherDetail);
    const dialog = await openDelete(user);
    await user.click(within(dialog).getByRole('button', { name: 'Delete application' }));

    expect(await screen.findByRole('heading', { name: 'Applications list' })).toBeVisible();
    expect(await screen.findByText('Application deleted successfully.')).toBeVisible();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(deleteRequest).toHaveBeenCalledTimes(1);
    expect(detailRequest).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryState(queryKeys.applications.detail(application.id))).toBeUndefined();
    expect(queryClient.getQueryData(otherDetailKey)).toEqual(otherDetail);
    for (const key of [...applicationListKeys, queryKeys.dashboard]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    }
  });

  it('disables both dialog buttons, prevents duplicate deletion, and prevents cancel while deleting', async () => {
    mockApplicationDetails();
    const pending = deferredResponse();
    const deleteRequest = vi.fn(async () => {
      await pending.promise;
      return HttpResponse.json({ success: true });
    });
    server.use(http.delete(applicationUrl, deleteRequest));
    const { user } = renderDetail();
    const dialog = await openDelete(user);
    try {
      await user.click(within(dialog).getByRole('button', { name: 'Delete application' }));
      const deleting = await within(dialog).findByRole('button', { name: 'Deleting...' });
      const keep = within(dialog).getByRole('button', { name: 'Keep application' });
      expect(deleting).toBeDisabled();
      expect(keep).toBeDisabled();
      await user.click(deleting);
      await user.click(keep);
      const cancel = new Event('cancel', { cancelable: true });
      fireEvent(dialog, cancel);
      expect(cancel.defaultPrevented).toBe(true);
      expect(dialog).toHaveAttribute('open');
      await waitFor(() => expect(deleteRequest).toHaveBeenCalledTimes(1));
    } finally {
      pending.resolve();
      await screen.findByRole('heading', { name: 'Applications list' });
    }
    expect(await screen.findByRole('heading', { name: 'Applications list' })).toBeVisible();
    expect(deleteRequest).toHaveBeenCalledTimes(1);
  });

  it.each([403, 500, 'network'] as const)('closes the dialog on a %s error, preserves caches, and allows confirmation of a retry', async (failure) => {
    mockApplicationDetails();
    const message = failure === 'network' ? 'Network Error' : 'This application could not be deleted';
    const deleteRequest = vi.fn()
      .mockImplementationOnce(() => failure === 'network' ? HttpResponse.error() : HttpResponse.json({ message }, { status: failure }))
      .mockImplementation(() => HttpResponse.json({ success: true }));
    server.use(http.delete(applicationUrl, deleteRequest));
    const { user, queryClient } = renderDetail();
    seedApplicationCaches(queryClient);
    const dialog = await openDelete(user);
    await user.click(within(dialog).getByRole('button', { name: 'Delete application' }));

    expect(await screen.findByText(message)).toBeVisible();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: application.position })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Applications list' })).not.toBeInTheDocument();
    expect(queryClient.getQueryData(queryKeys.applications.detail(application.id))).toEqual(detailResponse());
    for (const key of [...applicationListKeys, queryKeys.dashboard]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false);
    }
    const retryDialog = await openDelete(user);
    expect(deleteRequest).toHaveBeenCalledTimes(1);
    await user.click(within(retryDialog).getByRole('button', { name: 'Delete application' }));
    expect(await screen.findByRole('heading', { name: 'Applications list' })).toBeVisible();
    expect(await screen.findByText('Application deleted successfully.')).toBeVisible();
    expect(deleteRequest).toHaveBeenCalledTimes(2);
  });
});
