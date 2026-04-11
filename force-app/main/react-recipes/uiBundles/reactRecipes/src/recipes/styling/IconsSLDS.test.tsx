import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import IconsSLDS from './IconsSLDS';

describe('IconsSLDS', () => {
  it('renders without crashing', () => {
    render(<IconsSLDS />);
  });

  it('renders all category headings', () => {
    render(<IconsSLDS />);
    expect(screen.getByText('Utility')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders utility icon names', () => {
    render(<IconsSLDS />);
    // Each icon name appears as both assistive text and visible label
    expect(screen.getAllByText('home').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('settings').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('search').length).toBeGreaterThanOrEqual(1);
  });

  it('renders standard icon names', () => {
    render(<IconsSLDS />);
    expect(screen.getAllByText('account').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('contact').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('opportunity').length).toBeGreaterThanOrEqual(1);
  });

  it('renders action icon names', () => {
    render(<IconsSLDS />);
    expect(screen.getAllByText('new_note').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('share').length).toBeGreaterThanOrEqual(1);
  });

  it('renders SVG elements with aria-hidden', () => {
    const { container } = render(<IconsSLDS />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach(svg => {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('is accessible', async () => {
    const { container } = render(<IconsSLDS />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
