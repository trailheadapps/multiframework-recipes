/**
 * LWC Jest mounts with createElement() + document.body.appendChild() and queries
 * through the shadow root. React Testing Library replaces all of that:
 *
 *   LWC:   const el = createElement('c-hello', { is: HelloWorld });
 *          document.body.appendChild(el);
 *          expect(el.shadowRoot.querySelector('p').textContent).toBe('Hello, World!');
 *
 *   React: render(<HelloWorld />);
 *          expect(screen.getByText('Hello, World!')).toBeInTheDocument();
 */
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import HelloWorld from './HelloWorld';

describe('HelloWorld', () => {
  it('renders the greeting', () => {
    render(<HelloWorld />);

    // screen searches the full document rather than a shadow root.
    // getByText() throws immediately if absent — no null checks needed.
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<HelloWorld />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
