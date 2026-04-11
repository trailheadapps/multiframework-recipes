import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import CodeBlock from './CodeBlock';
export interface RecipeItem {
  name: string;
  description?: string;
  component: ReactNode;
  source: string;
}

interface LayoutProps {
  header: string;
  recipes?: RecipeItem[];
}

export default function Layout({ header, recipes = [] }: LayoutProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  // Derive initial index from ?recipe param; track the param we last consumed
  // to detect new search navigations without using setState in an effect.
  const recipeParam = searchParams.get('recipe');
  const [state, setState] = useState(() => {
    const idx = recipeParam ? parseInt(recipeParam, 10) : 0;
    return {
      selectedIndex: idx >= 0 && idx < recipes.length ? idx : 0,
      consumedParam: recipeParam,
    };
  });

  let { selectedIndex } = state;

  // When the ?recipe param changes (e.g. from search), update the selection.
  // This runs during render (not in an effect) so there's no cascading setState.
  if (recipeParam !== null && recipeParam !== state.consumedParam) {
    const idx = parseInt(recipeParam, 10);
    if (idx >= 0 && idx < recipes.length) {
      selectedIndex = idx;
    }
    setState({ selectedIndex, consumedParam: recipeParam });
    setSearchParams({}, { replace: true });
  }

  const [codeExpanded, setCodeExpanded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const selected = recipes[selectedIndex];

  // Collapse code when switching recipes
  function selectRecipe(i: number) {
    setState((s) => ({ ...s, selectedIndex: i }));
    setCodeExpanded(false);
  }

  return (
    <div className="py-4">
      {/* Page Header */}
      {header && (
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight">{header}</h1>
          <div className="mt-1.5 h-0.5 w-12 rounded-full bg-primary" />
        </div>
      )}

      {/* Two-column layout: sidebar | main */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,4fr)] gap-5">
        {/* Sidebar */}
        <nav
          className="sticky top-20 h-[calc(100vh-12rem)] overflow-y-auto rounded-lg border border-primary/70 bg-card p-2"
          aria-label="Recipes"
        >
          <ul className="space-y-0.5">
            {recipes.map((recipe, i) => (
              <li key={recipe.name}>
                <button
                  onClick={() => selectRecipe(i)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                    i === selectedIndex
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {recipe.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Recipe + Code */}
        {selected ? (
          <div
            className={cn(
              'grid items-start',
              isTransitioning && 'transition-[grid-template-columns,gap] duration-300 ease-in-out'
            )}
            style={{
              gridTemplateColumns: codeExpanded
                ? '0fr minmax(0,1fr)'
                : 'minmax(0,1fr) minmax(0,1fr)',
              gap: codeExpanded ? '0px' : '1.25rem',
            }}
          >
            <div
              className={cn(
                'sticky top-20 h-[calc(100vh-12rem)] min-w-0 overflow-hidden rounded-xl',
                isTransitioning && 'transition-opacity duration-300',
                codeExpanded
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100 overflow-y-auto'
              )}
            >
              <Card className="min-h-full border-primary/70 shadow-none">
                <CardHeader>
                  <CardTitle>{selected.name}</CardTitle>
                  {selected.description && (
                    <CardDescription>{selected.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="slds-card__body_inner">
                  {selected.component}
                </CardContent>
              </Card>
            </div>

            {/* Code — container always mounted, content fades in */}
            <div className="sticky top-20 h-[calc(100vh-12rem)]" style={{ contain: 'layout style' }}>
              <CodeBlock
                source={selected.source}
                expanded={codeExpanded}
                onToggleExpand={() => {
                  setIsTransitioning(true);
                  setCodeExpanded((v) => !v);
                  setTimeout(() => setIsTransitioning(false), 300);
                }}
              />
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No recipes yet.</p>
        )}
      </div>
    </div>
  );
}
