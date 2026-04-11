import Layout, { type RecipeItem } from '@/components/app/Layout';
import SearchableAccountList from '@/recipes/integration/SearchableAccountList';
import DashboardAliasedQueries from '@/recipes/integration/DashboardAliasedQueries';

import searchableAccountListSource from '@/recipes/integration/SearchableAccountList.tsx?shiki';
import dashboardAliasedQueriesSource from '@/recipes/integration/DashboardAliasedQueries.tsx?shiki';

export default function Integration() {
  const recipes: RecipeItem[] = [
    {
      name: 'Searchable Account List',
      description:
        'A controlled search input drives a GraphQL variable with debounce. Combines: variables, imperative refetch, and loading states in one cohesive pattern.',
      component: <SearchableAccountList />,
      source: searchableAccountListSource,
    },
    {
      name: 'Dashboard with Aliased Queries',
      description:
        'Fetches Accounts, Contacts, and Opportunities in a single aliased GraphQL request and renders a stat-card dashboard. Combines: aliased queries, data transformation, and layout composition.',
      component: <DashboardAliasedQueries />,
      source: dashboardAliasedQueriesSource,
    },
  ];

  return <Layout header="Integration Patterns" recipes={recipes} />;
}
