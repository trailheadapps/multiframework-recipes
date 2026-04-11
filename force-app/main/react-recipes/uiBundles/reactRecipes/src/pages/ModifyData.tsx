import Layout, { type RecipeItem } from '@/components/app/Layout';
import CreateRecord from '@/recipes/modify-data/CreateRecord';
import UpdateRecord from '@/recipes/modify-data/UpdateRecord';
import DeleteRecord from '@/recipes/modify-data/DeleteRecord';
import ServerErrorHandling from '@/recipes/modify-data/ServerErrorHandling';
import QueryMutationTogether from '@/recipes/modify-data/QueryMutationTogether';

import createRecordSource from '@/recipes/modify-data/CreateRecord.tsx?shiki';
import updateRecordSource from '@/recipes/modify-data/UpdateRecord.tsx?shiki';
import deleteRecordSource from '@/recipes/modify-data/DeleteRecord.tsx?shiki';
import serverErrorSource from '@/recipes/modify-data/ServerErrorHandling.tsx?shiki';
import queryMutationSource from '@/recipes/modify-data/QueryMutationTogether.tsx?shiki';

export default function ModifyData() {
  const recipes: RecipeItem[] = [
    {
      name: 'Create a Record',
      description:
        "Creates a Salesforce Account via the AccountCreate UIAPI mutation on form submit. The mutation response includes the new record's Id and Name. In LWC you'd use createRecord() from lightning/uiRecordApi; here the mutation names the object type and the exact fields being sent.",
      component: <CreateRecord />,
      source: createRecordSource,
    },
    {
      name: 'Update a Record',
      description:
        'Loads an Account and lets you edit Name and Industry via the AccountUpdate mutation. In LWC, updateRecord() from lightning/uiRecordApi automatically notifies @wire adapters; here you patch local state from the server response.',
      component: <UpdateRecord />,
      source: updateRecordSource,
    },
    {
      name: 'Delete a Record',
      description:
        "Lists Accounts with a delete button per row. Confirming calls the AccountDelete mutation and removes the row from local state. In LWC you'd use deleteRecord() from lightning/uiRecordApi; here the row is removed from local state once the mutation succeeds.",
      component: <DeleteRecord />,
      source: deleteRecordSource,
    },
    {
      name: 'Server-Side Error Handling',
      description:
        'Handles top-level GraphQL errors from a UIAPI mutation. The form intentionally omits the required LastName field so you can submit and observe a REQUIRED_FIELD_MISSING error.',
      component: <ServerErrorHandling />,
      source: serverErrorSource,
    },
    {
      name: 'Query + Mutation Together',
      description:
        "Lists Accounts with inline editing. Clicking Edit opens an inline form; saving calls AccountUpdate and patches that row in local state. Unlike @wire in LWC, local state has to be synced manually from the server response using useState.",
      component: <QueryMutationTogether />,
      source: queryMutationSource,
    },
  ];

  return <Layout header="Modify Data" recipes={recipes} />;
}
