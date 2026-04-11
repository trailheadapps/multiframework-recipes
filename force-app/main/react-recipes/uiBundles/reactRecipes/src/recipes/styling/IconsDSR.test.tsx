import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import IconsDSR from './IconsDSR';

vi.mock('@salesforce/design-system-react', () => ({
  IconSettings: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Icon: ({
    assistiveText,
    category,
    name,
  }: {
    assistiveText: { label: string };
    category: string;
    name: string;
    size?: string;
  }) => (
    <span role="img" aria-label={assistiveText.label} data-category={category} data-name={name} />
  ),
}));

describe('IconsDSR', () => {
  it('renders without crashing', () => {
    render(<IconsDSR />);
  });

  it('renders all category headings', () => {
    render(<IconsDSR />);
    expect(screen.getByText('Utility')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders utility icon names as labels', () => {
    render(<IconsDSR />);
    expect(screen.getAllByText('home').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('settings').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('search').length).toBeGreaterThanOrEqual(1);
  });

  it('renders standard icon names as labels', () => {
    render(<IconsDSR />);
    expect(screen.getAllByText('account').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('contact').length).toBeGreaterThanOrEqual(1);
  });

  it('renders action icon names as labels', () => {
    render(<IconsDSR />);
    expect(screen.getAllByText('new_note').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('share').length).toBeGreaterThanOrEqual(1);
  });

  it('renders icon elements with aria-labels', () => {
    render(<IconsDSR />);
    const icons = screen.getAllByRole('img');
    expect(icons.length).toBe(18); // 6 utility + 6 standard + 6 action
  });

  it('is accessible', async () => {
    const { container } = render(<IconsDSR />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
