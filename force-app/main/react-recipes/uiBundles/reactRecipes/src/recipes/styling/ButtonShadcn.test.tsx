import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ButtonShadcn from './ButtonShadcn';

describe('ButtonShadcn', () => {
  it('renders without crashing', () => {
    render(<ButtonShadcn />);
  });

  it('renders all variant buttons', () => {
    render(<ButtonShadcn />);
    // "Default", "Destructive", "Outline" appear in multiple sections
    expect(screen.getAllByText('Default').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Destructive').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Outline').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Secondary')).toBeInTheDocument();
    expect(screen.getByText('Ghost')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
  });

  it('renders size variants', () => {
    render(<ButtonShadcn />);
    expect(screen.getByText('Small')).toBeInTheDocument();
    expect(screen.getByText('Large')).toBeInTheDocument();
  });

  it('renders buttons with icons', () => {
    render(<ButtonShadcn />);
    expect(screen.getByText('New Record')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Options')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('renders section headings', () => {
    render(<ButtonShadcn />);
    expect(screen.getByText('Variants')).toBeInTheDocument();
    expect(screen.getByText('Sizes')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('With Icons')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<ButtonShadcn />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
