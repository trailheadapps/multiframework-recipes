import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ButtonDSR from './ButtonDSR';

vi.mock('@salesforce/design-system-react', () => ({
  Button: ({
    label,
    disabled,
  }: {
    label: string;
    variant?: string;
    disabled?: boolean;
    iconCategory?: string;
    iconName?: string;
    iconPosition?: string;
  }) => (
    <button disabled={disabled}>{label}</button>
  ),
}));

describe('ButtonDSR', () => {
  it('renders without crashing', () => {
    render(<ButtonDSR />);
  });

  it('renders all variant buttons', () => {
    render(<ButtonDSR />);
    // Neutral and Brand appear in both Variants and Disabled sections
    expect(screen.getAllByText('Neutral').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Brand').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Outline Brand')).toBeInTheDocument();
    expect(screen.getByText('Destructive')).toBeInTheDocument();
    expect(screen.getByText('Text Destructive')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('renders disabled buttons', () => {
    render(<ButtonDSR />);
    const buttons = screen.getAllByRole('button');
    const disabledButtons = buttons.filter(b => b.hasAttribute('disabled'));
    expect(disabledButtons.length).toBe(2);
  });

  it('renders buttons with icons', () => {
    render(<ButtonDSR />);
    expect(screen.getByText('New Record')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('renders section headings', () => {
    render(<ButtonDSR />);
    expect(screen.getByText('Variants')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<ButtonDSR />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
