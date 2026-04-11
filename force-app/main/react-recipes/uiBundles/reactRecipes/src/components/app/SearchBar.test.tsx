import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Mock } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router';
import SearchBar from './SearchBar';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: vi.fn() };
});

describe('SearchBar', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderSearchBar() {
    return render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );
  }

  it('navigates with ?recipe= param for non-first recipes', async () => {
    const user = userEvent.setup();
    renderSearchBar();

    // Open search
    await user.click(screen.getByRole('button', { name: /search/i }));

    // Type a query that matches a non-first recipe (recipeIndex > 0)
    const input = screen.getByPlaceholderText('Search all recipes...');
    await user.type(input, 'Binding to an Account');

    // Click the result
    const result = screen.getByRole('button', { name: /Binding to an Account Name/i });
    fireEvent.click(result);

    expect(mockNavigate).toHaveBeenCalledWith('/hello?recipe=1');
  });

  it('navigates without ?recipe= param for first recipe in category', async () => {
    const user = userEvent.setup();
    renderSearchBar();

    await user.click(screen.getByRole('button', { name: /search/i }));

    const input = screen.getByPlaceholderText('Search all recipes...');
    await user.type(input, 'Hello World');

    const result = screen.getByRole('button', { name: /Hello World/i });
    fireEvent.click(result);

    expect(mockNavigate).toHaveBeenCalledWith('/hello');
  });

  it('navigates to the correct recipe on Enter key', async () => {
    const user = userEvent.setup();
    renderSearchBar();

    await user.click(screen.getByRole('button', { name: /search/i }));

    const input = screen.getByPlaceholderText('Search all recipes...');
    await user.type(input, 'Paginated List');

    // Press Enter to select the highlighted result
    await user.keyboard('{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith('/read-data?recipe=4');
  });
});
