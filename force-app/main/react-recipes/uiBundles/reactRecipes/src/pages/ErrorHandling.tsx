import Layout, { type RecipeItem } from '@/components/app/Layout';
import LoadingErrorEmpty from '@/recipes/error-handling/LoadingErrorEmpty';
import ErrorBoundaryRecipe from '@/recipes/error-handling/ErrorBoundaryRecipe';
import GraphqlErrors from '@/recipes/error-handling/GraphqlErrors';

import loadingErrorEmptySource from '@/recipes/error-handling/LoadingErrorEmpty.tsx?shiki';
import errorBoundarySource from '@/recipes/error-handling/ErrorBoundaryRecipe.tsx?shiki';
import graphqlErrorsSource from '@/recipes/error-handling/GraphqlErrors.tsx?shiki';

export default function ErrorHandling() {
  const recipes: RecipeItem[] = [
    {
      name: 'Loading, Error, and Empty States',
      description:
        'Every async component must handle loading, error, and empty states explicitly. In LWC, @wire provides data and error automatically; here you own all three as a discriminated union state machine. Use the simulation buttons to trigger each state on demand.',
      component: <LoadingErrorEmpty />,
      source: loadingErrorEmptySource,
    },
    {
      name: 'Error Boundary',
      description:
        'An Error Boundary is a class component that catches render-time exceptions thrown anywhere in its subtree and shows a fallback UI instead of crashing the page. There is no LWC equivalent. Click "Break It" to trigger a throw, then "Try Again" to reset.',
      component: <ErrorBoundaryRecipe />,
      source: errorBoundarySource,
    },
    {
      name: 'GraphQL Errors',
      description:
        'Executes a query that intentionally requests a nonexistent field to trigger a GraphQL error. UIAPI surfaces these in result.errors[] rather than throwing — run both queries to see the difference between query-level errors and thrown exceptions.',
      component: <GraphqlErrors />,
      source: graphqlErrorsSource,
    },
  ];

  return <Layout header="Error Handling" recipes={recipes} />;
}
