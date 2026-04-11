import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Layout, { type RecipeItem } from './Layout';

const recipes: RecipeItem[] = [
  { name: 'Recipe A', description: 'First', component: <p>A</p>, source: '// A' },
  { name: 'Recipe B', description: 'Second', component: <p>B</p>, source: '// B' },
  { name: 'Recipe C', description: 'Third', component: <p>C</p>, source: '// C' },
];

function renderWithRouter(initialEntry = '/test') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Layout header="Test" recipes={recipes} />
    </MemoryRouter>
  );
}

describe('Layout', () => {
  it('selects the first recipe by default', () => {
    renderWithRouter();
    // The recipe component content is rendered in the main area
    expect(screen.getByText('A')).toBeInTheDocument();
    // Description shown in the card
    expect(screen.getByText('First')).toBeInTheDocument();
  });

  it('selects the recipe specified by the ?recipe query param', () => {
    renderWithRouter('/test?recipe=2');
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('falls back to the first recipe for an out-of-range ?recipe param', () => {
    renderWithRouter('/test?recipe=99');
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('falls back to the first recipe for a negative ?recipe param', () => {
    renderWithRouter('/test?recipe=-1');
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('switches recipes when a sidebar button is clicked', () => {
    renderWithRouter();
    fireEvent.click(screen.getByRole('button', { name: 'Recipe B' }));
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
