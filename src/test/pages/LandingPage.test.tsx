import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import LandingPage from '@pages/LandingPage';
import { renderWithProviders } from '@/test/utils/render-with-providers';

function renderLanding() {
  const user = userEvent.setup();
  renderWithProviders(
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={<h1>Log in</h1>} />
      <Route path='/register' element={<h1>Create an account</h1>} />
    </Routes>,
    { initialEntries: ['/'] },
  );
  return user;
}

describe('LandingPage', () => {
  it('renders the main message, features, onboarding steps, and footer', () => {
    renderLanding();
    const main = within(screen.getByRole('main'));
    expect(main.getByRole('heading', {
      level: 1, name: /^Big ambitions\.\s*Beautifully organized\.$/,
    })).toBeVisible();
    for (const name of [
      'Every application, together',
      'Every stage, in view',
      'Your progress, made clear',
      'Make it your space',
      'Log your applications',
      'Follow your progress',
    ]) {
      expect(main.getByRole('heading', { name })).toBeVisible();
    }
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    const footer = within(screen.getByRole('contentinfo'));
    expect(footer.getByText('Made for your next move.')).toBeVisible();
    expect(footer.getByText(new RegExp(`${new Date().getFullYear()} JobFolio$`))).toBeVisible();
    for (const brand of screen.getAllByRole('link', { name: 'JobFolio home' })) {
      expect(brand).toHaveAttribute('href', '/');
    }
  });

  it('shows the labeled product preview and its sample applications', () => {
    renderLanding();
    const preview = within(screen.getByRole('region', { name: 'Example of the JobFolio dashboard' }));
    expect(preview.getByText('Product preview')).toBeVisible();
    expect(preview.getByRole('heading', { name: 'Recent applications' })).toBeVisible();
    for (const text of [
      'Linear', 'Product Designer', 'Interview',
      'Notion', 'Frontend Developer', 'Applied',
      'Figma', 'Design Engineer', 'Offer',
    ]) {
      expect(preview.getByText(text)).toBeVisible();
    }
  });

  it('opens login from the header', async () => {
    const user = renderLanding();
    const login = within(screen.getByRole('banner')).getByRole('link', { name: 'Log in' });
    expect(login).toHaveAttribute('href', '/login');
    await user.click(login);
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeVisible();
    expect(screen.queryByRole('region', { name: 'Example of the JobFolio dashboard' })).not.toBeInTheDocument();
  });

  it.each([
    'Get started',
    'Start tracking your applications',
    'Find your starting point',
    'Start your application tracker',
  ])('opens registration through "%s"', async (name) => {
    const user = renderLanding();
    const link = screen.getByRole('link', { name });
    expect(link).toHaveAttribute('href', '/register');
    await user.click(link);
    expect(await screen.findByRole('heading', { name: 'Create an account' })).toBeVisible();
  });

  it.each([
    { name: 'Features', target: 'features' },
    { name: 'How it works', target: 'how-it-works' },
    { name: 'Take a look', target: 'preview' },
  ])('points "$name" to an existing section', ({ name, target }) => {
    renderLanding();
    expect(screen.getByRole('link', { name })).toHaveAttribute('href', `#${target}`);
    // jsdom cannot test scrolling, but the fragment must resolve to visible content.
    expect(document.getElementById(target)).toBeVisible();
  });
});
