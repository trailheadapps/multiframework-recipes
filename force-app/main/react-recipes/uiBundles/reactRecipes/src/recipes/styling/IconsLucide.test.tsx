import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import IconsLucide from './IconsLucide';

describe('IconsLucide', () => {
  it('renders without crashing', () => {
    render(<IconsLucide />);
  });

  it('renders all icon names as labels', () => {
    render(<IconsLucide />);
    const expectedNames = [
      'Home', 'Settings', 'Plus', 'Trash2', 'Search', 'Pencil',
      'User', 'Building2', 'TrendingUp', 'Users', 'Briefcase',
      'CheckSquare', 'Bell', 'Mail', 'Calendar', 'ChevronRight',
      'Star', 'Lock', 'Upload', 'Download',
    ];
    for (const name of expectedNames) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('renders 20 list items', () => {
    render(<IconsLucide />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(20);
  });

  it('renders SVG elements with aria-hidden', () => {
    const { container } = render(<IconsLucide />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(20);
    svgs.forEach(svg => {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('is accessible', async () => {
    const { container } = render(<IconsLucide />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
