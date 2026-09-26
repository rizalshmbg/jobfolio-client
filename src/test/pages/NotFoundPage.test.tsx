import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import App from '@/App';
import { renderWithProviders } from '@/test/utils/render-with-providers';

function renderUnknownRoute(path = '/missing-page') {
  const user = userEvent.setup();
  // Use the application's actual wildcard route and home page for recovery.
  renderWithProviders(<App />, { initialEntries: [path] });
  return user;
}

describe('NotFoundPage', () => {
  it.each(['/missing-page', '/applications/no/such/route'])(
    'renders the 404 page for the unmatched route %s', async (path) => {
      renderUnknownRoute(path);
      expect(await screen.findByRole('heading', { name: 'A little off the beaten path.' })).toBeVisible();
      const main = within(screen.getByRole('main'));
      expect(main.getByText('404')).toBeVisible();
      expect(main.getByText("We couldn't find this page. Let's get you back to your next move.")).toBeVisible();
      expect(main.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
      expect(main.getByRole('link', { name: 'JobFolio home' })).toHaveAttribute('href', '/');
    },
  );

  it.each(['Back to home', 'JobFolio home'])('returns to the real landing page through "%s"', async (name) => {
    const user = renderUnknownRoute();
    await screen.findByRole('heading', { name: 'A little off the beaten path.' });
    await user.click(screen.getByRole('link', { name }));

    expect(await screen.findByRole('heading', {
      level: 1, name: /^Big ambitions\.\s*Beautifully organized\.$/,
    })).toBeVisible();
    expect(screen.queryByText('404')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Back to home' })).not.toBeInTheDocument();
  });
});
