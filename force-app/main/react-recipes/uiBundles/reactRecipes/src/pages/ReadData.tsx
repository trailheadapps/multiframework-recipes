import Layout, { type RecipeItem } from '@/components/app/Layout';
import SingleRecord from '@/recipes/read-data/SingleRecord';
import ListOfRecords from '@/recipes/read-data/ListOfRecords';
import FilteredList from '@/recipes/read-data/FilteredList';
import PaginatedList from '@/recipes/read-data/PaginatedList';
import RelatedRecords from '@/recipes/read-data/RelatedRecords';
import SortedResults from '@/recipes/read-data/SortedResults';
import AliasedMultiObjectQuery from '@/recipes/read-data/AliasedMultiObjectQuery';
import ImperativeRefetch from '@/recipes/read-data/ImperativeRefetch';

import singleRecordSource from '@/recipes/read-data/SingleRecord.tsx?shiki';
import listOfRecordsSource from '@/recipes/read-data/ListOfRecords.jsx?shiki';
import filteredListSource from '@/recipes/read-data/FilteredList.tsx?shiki';
import paginatedListSource from '@/recipes/read-data/PaginatedList.tsx?shiki';
import relatedRecordsSource from '@/recipes/read-data/RelatedRecords.tsx?shiki';
import sortedResultsSource from '@/recipes/read-data/SortedResults.tsx?shiki';
import aliasedMultiObjectQuerySource from '@/recipes/read-data/AliasedMultiObjectQuery.tsx?shiki';
import imperativeRefetchSource from '@/recipes/read-data/ImperativeRefetch.tsx?shiki';

export default function ReadData() {
  const recipes: RecipeItem[] = [
    {
      name: 'Single Record',
      description:
        "Queries a single Contact via UIAPI GraphQL and displays its fields. In LWC you'd reach for @wire(getRecord); here useEffect fires on mount and you manage loading, error, and data as useState variables yourself.",
      component: <SingleRecord />,
      source: singleRecordSource,
    },
    {
      name: 'List of Records',
      description:
        "Queries multiple Contacts via UIAPI GraphQL and renders each one. In LWC you'd use a @wire adapter or Apex to return an array of records. Here the response uses the Relay connection shape — records arrive as edges[].node instead of a plain array.",
      component: <ListOfRecords />,
      source: listOfRecordsSource,
    },
    {
      name: 'Filtered List with Variables',
      description:
        'Queries Contacts by name using a GraphQL variable bound to an input field. In LWC a tracked property passed to @wire re-executes automatically; here the useEffect dependency array re-runs the fetch whenever the search value changes.',
      component: <FilteredList />,
      source: filteredListSource,
    },
    {
      name: 'Sorted Results',
      description:
        'Fetches Contacts with an orderBy argument driven by component state. Changing the sort field or direction re-runs the query via useEffect — similar to passing a reactive property to @wire in LWC. Note that orderBy can\'t use GraphQL variables in UIAPI, so the query is rebuilt on each change.',
      component: <SortedResults />,
      source: sortedResultsSource,
    },
    {
      name: 'Paginated List',
      description:
        'Fetches two Contacts at a time using Relay cursor pagination (first / after). Each "Load More" click passes pageInfo.endCursor as $after, appending the next page to local state.',
      component: <PaginatedList />,
      source: paginatedListSource,
    },
    {
      name: 'Related Records',
      description:
        'Queries Contacts with their parent Account in a single GraphQL request, traversing a lookup relationship. In LWC this requires separate @wire calls; here one query covers both objects.',
      component: <RelatedRecords />,
      source: relatedRecordsSource,
    },
    {
      name: 'Aliased Multi-Object Query',
      description:
        "Queries Accounts and Contacts in a single GraphQL request using aliases. In LWC you'd need two @wire calls or an Apex method to fetch two objects; here aliases let you combine them into one round-trip.",
      component: <AliasedMultiObjectQuery />,
      source: aliasedMultiObjectQuerySource,
    },
    {
      name: 'Imperative Refetch',
      description:
        "Displays a Contact list with a Refresh button that re-invokes the query on demand. Unlike LWC's reactive @wire, React gives you full control over when data is fetched.",
      component: <ImperativeRefetch />,
      source: imperativeRefetchSource,
    },
  ];

  return <Layout header="Read Data" recipes={recipes} />;
}
