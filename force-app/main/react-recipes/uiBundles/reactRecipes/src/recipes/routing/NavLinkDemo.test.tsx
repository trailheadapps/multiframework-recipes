// <NavLink> sets aria-current="page" on the active link automatically.
// In LWC you'd wire CurrentPageReference, compare URLs manually, and toggle
// a CSS class yourself. Here the router does all of that — the test controls
// which URL is "current" by passing initialEntries to MemoryRouter.
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { axe } from 'vitest-axe';
import NavLinkDemo from './NavLinkDemo';

describe('NavLinkDemo', () => {
  function renderAt(path: string) {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <NavLinkDemo />
      </MemoryRouter>
    );
  }

  it('sets aria-current="page" on the link that matches the current URL', () => {
    renderAt('/routing');
    // React Router sets this automatically — no manual comparison needed.
    // LWC equivalent: wiring CurrentPageReference and comparing page.attributes.
    expect(screen.getByRole('link', { name: 'Routing' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('does not set aria-current on non-matching links', () => {
    renderAt('/routing');
    expect(screen.getByRole('link', { name: 'Hello' })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('applies bg-accent styling to the active link', () => {
    renderAt('/routing');
    // bg-accent is now on the <a> (via useMatch in NavItem).
    const activeLink = screen.getByRole('link', { name: 'Routing' });
    expect(activeLink).toHaveClass('bg-accent');
  });

  it('does not apply bg-accent to non-matching links', () => {
    renderAt('/routing');
    const inactiveLink = screen.getByRole('link', { name: 'Hello' });
    expect(inactiveLink).not.toHaveClass('bg-accent');
  });

  it('is accessible', async () => {
    const { container } = renderAt('/routing');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
