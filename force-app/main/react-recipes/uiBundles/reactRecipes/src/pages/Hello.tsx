import Layout, { type RecipeItem } from '@/components/app/Layout';
import HelloWorld from '@/recipes/hello/HelloWorld';
import BindingAccountName from '@/recipes/hello/BindingAccountName';
import ConditionalStatus from '@/recipes/hello/ConditionalStatus';
import ListOfAccounts from '@/recipes/hello/ListOfAccounts';
import LifecycleFetch from '@/recipes/hello/LifecycleFetch';
import ParentToChild from '@/recipes/hello/ParentToChild';
import ChildToParent from '@/recipes/hello/ChildToParent';
import StateManagement from '@/recipes/hello/StateManagement';

import helloWorldSource from '@/recipes/hello/HelloWorld.tsx?shiki';
import bindingAccountNameSource from '@/recipes/hello/BindingAccountName.tsx?shiki';
import conditionalStatusSource from '@/recipes/hello/ConditionalStatus.tsx?shiki';
import listOfAccountsSource from '@/recipes/hello/ListOfAccounts.tsx?shiki';
import lifecycleFetchSource from '@/recipes/hello/LifecycleFetch.tsx?shiki';
import parentToChildSource from '@/recipes/hello/ParentToChild.tsx?shiki';
import childToParentSource from '@/recipes/hello/ChildToParent.tsx?shiki';
import stateManagementSource from '@/recipes/hello/StateManagement.tsx?shiki';

export default function Hello() {
  const recipes: RecipeItem[] = [
    {
      name: 'Hello World',
      description:
        'The simplest possible Salesforce web application component. A React component renders inside a Salesforce web app exactly like any other React app — no special wiring required.',
      component: <HelloWorld />,
      source: helloWorldSource,
    },
    {
      name: 'Binding to an Account Name',
      description:
        'Fetches an Account via UIAPI GraphQL and binds the Name field to JSX. Introduces the { value } wrapper that Salesforce GraphQL uses for all scalar fields.',
      component: <BindingAccountName />,
      source: bindingAccountNameSource,
    },
    {
      name: 'Conditional Rendering',
      description:
        'Fetches an Account and conditionally renders different UI based on the Industry picklist value. Uses the {condition && <Element />} pattern and the ternary operator with real Salesforce data.',
      component: <ConditionalStatus />,
      source: conditionalStatusSource,
    },
    {
      name: 'List Rendering (For Each)',
      description:
        "Fetches Accounts via GraphQL and renders them using Array.map(). Each item uses the record Id as its key prop — the React equivalent of LWC's for:each directive.",
      component: <ListOfAccounts />,
      source: listOfAccountsSource,
    },
    {
      name: 'Lifecycle (Fetch on Mount)',
      description:
        'Uses useEffect to fetch a Contact on mount. A stale flag in the cleanup function prevents state updates after unmount — the React equivalent of disconnectedCallback.',
      component: <LifecycleFetch />,
      source: lifecycleFetchSource,
    },
    {
      name: 'Parent-to-Child (Props)',
      description:
        "The parent fetches Accounts via GraphQL and passes each one to a child component as props. The child is a pure display component — the React equivalent of LWC's @api properties.",
      component: <ParentToChild />,
      source: parentToChildSource,
    },
    {
      name: 'Child-to-Parent (Callbacks)',
      description:
        "A child component presents an Industry selector and calls a parent callback when the user picks a value. The parent fetches matching Accounts. React equivalent of LWC's CustomEvent.",
      component: <ChildToParent />,
      source: childToParentSource,
    },
    {
      name: 'State Management (Lifted State)',
      description:
        "Two sibling components share a selected Account by lifting state to their common parent. In LWC you'd reach for the Lightning Message Service to share state between siblings; in React the idiomatic answer is lifting it to the nearest common ancestor.",
      component: <StateManagement />,
      source: stateManagementSource,
    },
  ];

  return <Layout header="Hello" recipes={recipes} />;
}
