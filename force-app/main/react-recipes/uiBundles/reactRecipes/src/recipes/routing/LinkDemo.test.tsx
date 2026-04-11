// In LWC you'd mock NavigationMixin and assert that Navigate() was called with
// a typed PageReference object. <Link> renders as a plain <a> in the DOM, so
// tests can simply assert href values — no navigation mocking needed at all.
//
// All components that use <Link>, <NavLink>, or useNavigate must be rendered
// inside a router. MemoryRouter provides a full in-memory routing context
// without requiring a real browser URL bar — the React equivalent of the
// jsdom environment LWC Jest already provides, but with routing baked in.
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { axe } from 'vitest-axe';
import LinkDemo from './LinkDemo';

describe('LinkDemo', () => {
  function renderInRouter() {
    return render(
      <MemoryRouter>
        <LinkDemo />
      </MemoryRouter>
    );
  }

  it('renders a link for every app page', () => {
    renderInRouter();
    expect(screen.getByRole('link', { name: 'Hello' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Read Data' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Routing' })).toBeInTheDocument();
  });

  it('renders <Link> as a plain <a> element with the correct href', () => {
    renderInRouter();
    // <Link to="/hello"> becomes <a href="/hello"> in the DOM.
    // LWC equivalent: NavigationMixin.Navigate({ type: 'standard__navItemPage', ... })
    // Here the URL is just a string and the assertion is a simple attribute check.
    expect(screen.getByRole('link', { name: 'Hello' })).toHaveAttribute(
      'href',
      '/hello'
    );
    expect(
      screen.getByRole('link', { name: 'Read Data' })
    ).toHaveAttribute('href', '/read-data');
  });

  it('is accessible', async () => {
    const { container } = renderInRouter();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
