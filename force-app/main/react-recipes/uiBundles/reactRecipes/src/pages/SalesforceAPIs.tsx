import Layout, { type RecipeItem } from '@/components/app/Layout';
import DisplayCurrentUser from '@/recipes/salesforce-apis/DisplayCurrentUser';
import ConnectApi from '@/recipes/salesforce-apis/ConnectApi';
import UiApiRest from '@/recipes/salesforce-apis/UiApiRest';
import ApexRest from '@/recipes/salesforce-apis/ApexRest';

import displayCurrentUserSource from '@/recipes/salesforce-apis/DisplayCurrentUser.tsx?shiki';
import connectApiSource from '@/recipes/salesforce-apis/ConnectApi.tsx?shiki';
import uiApiRestSource from '@/recipes/salesforce-apis/UiApiRest.tsx?shiki';
import apexRestSource from '@/recipes/salesforce-apis/ApexRest.tsx?shiki';

export default function SalesforceAPIs() {
  const recipes: RecipeItem[] = [
    {
      name: 'Display Current User',
      description:
        'Fetches the current user via the Chatter REST endpoint /users/me using DataSDK.fetch. Returns plain JSON with displayName and email.',
      component: <DisplayCurrentUser />,
      source: displayCurrentUserSource,
    },
    {
      name: 'Connect API',
      description:
        'Reads the org\'s file upload config from the Connect REST resource connect/file/upload/config via DataSDK.fetch. Deployed UI Bundles can reach only specific Connect resources, not all of connect/* or chatter/*.',
      component: <ConnectApi />,
      source: connectApiSource,
    },
    {
      name: 'UI API (REST)',
      description:
        'Lists Contacts from a list view via UI API and DataSDK.fetch. REST fields include { displayValue } with locale-aware formatting that GraphQL doesn\'t expose.',
      component: <UiApiRest />,
      source: uiApiRestSource,
    },
    {
      name: 'Apex REST',
      description:
        'Calls a custom Apex REST endpoint to fetch Contacts via DataSDK.fetch. Unlike UIAPI responses, Apex returns plain JSON with no { value } wrappers.',
      component: <ApexRest />,
      source: apexRestSource,
    },
  ];

  return <Layout header="Salesforce APIs" recipes={recipes} />;
}
