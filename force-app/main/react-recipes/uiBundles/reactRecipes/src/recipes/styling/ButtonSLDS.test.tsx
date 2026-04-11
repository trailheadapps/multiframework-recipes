import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ButtonSLDS from './ButtonSLDS';

describe('ButtonSLDS', () => {
  it('renders all six variant buttons with correct SLDS classes', () => {
    render(<ButtonSLDS />);
    const buttons = screen.getAllByRole('button');

    const variantClasses = [
      'slds-button_neutral',
      'slds-button_brand',
      'slds-button_outline-brand',
      'slds-button_destructive',
      'slds-button_text-destructive',
      'slds-button_success',
    ];

    for (const cls of variantClasses) {
      const match = buttons.find(b => b.classList.contains(cls));
      expect(match, `expected a button with class ${cls}`).toBeTruthy();
    }
  });

  it('renders two disabled buttons with the disabled attribute', () => {
    render(<ButtonSLDS />);
    const disabled = screen.getAllByRole('button').filter(b => b.hasAttribute('disabled'));
    expect(disabled).toHaveLength(2);
    expect(disabled[0]).toHaveClass('slds-button_neutral');
    expect(disabled[1]).toHaveClass('slds-button_brand');
  });

  it('renders icon-only buttons with assistive text', () => {
    render(<ButtonSLDS />);
    expect(screen.getByTitle('Settings')).toHaveClass('slds-button_icon-border-filled');
    expect(screen.getByTitle('Add')).toHaveClass('slds-button_icon-brand');
  });

  it('renders label+icon buttons', () => {
    render(<ButtonSLDS />);
    expect(screen.getByRole('button', { name: /New Record/ })).toHaveClass('slds-button_neutral');
    expect(screen.getByRole('button', { name: /Upload/ })).toHaveClass('slds-button_brand');
  });

  it('renders section headings', () => {
    render(<ButtonSLDS />);
    expect(screen.getByText('Variants')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('Icon Buttons')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<ButtonSLDS />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
