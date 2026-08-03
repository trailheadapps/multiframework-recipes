/**
 * AutoResize is a pure UI recipe — the bootstrap ResizeObserver does the SDK
 * work invisibly. So the test focuses on what the component actually controls:
 * add/remove items and clear-all behavior.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import AutoResize from './AutoResize';

describe('AutoResize', () => {
  it('starts with two items', () => {
    render(<AutoResize />);
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getAllByText(/^Item \d+/)).toHaveLength(2);
  });

  it('adds an item when the Add button is clicked', async () => {
    const user = userEvent.setup();
    render(<AutoResize />);

    await user.click(screen.getByRole('button', { name: /Add item/i }));

    expect(screen.getByText('3 items')).toBeInTheDocument();
    expect(screen.getAllByText(/^Item \d+/)).toHaveLength(3);
  });

  it('removes a single item via its remove button', async () => {
    const user = userEvent.setup();
    render(<AutoResize />);

    const removeButtons = screen.getAllByRole('button', {
      name: 'Remove item',
    });
    await user.click(removeButtons[0]);

    expect(screen.getByText('1 item')).toBeInTheDocument();
    expect(screen.getAllByText(/^Item \d+/)).toHaveLength(1);
  });

  it('empties the list on Clear all', async () => {
    const user = userEvent.setup();
    render(<AutoResize />);

    await user.click(screen.getByRole('button', { name: /Clear all/i }));

    expect(screen.getByText('0 items')).toBeInTheDocument();
    expect(
      screen.getByText(/iframe should be at minimum height/i)
    ).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<AutoResize />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
