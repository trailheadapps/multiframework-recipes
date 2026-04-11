/**
 * Create a Record
 *
 * Creates a Salesforce Account via the AccountCreate UIAPI mutation on form
 * submit. The mutation response includes the new record's Id and Name.
 *
 * LWC equivalent: createRecord() from lightning/uiRecordApi with an
 * apiName and fields object. The mutation here names the object type and
 * the exact fields being sent — same concept, GraphQL syntax.
 *
 * @see UpdateRecord — editing an existing record
 */
import { useState, type FormEvent } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// UIAPI mutations follow the pattern: uiapi.<Object>Create / Update / Delete.
// The input type is always <Object>CreateInput, and the response nests under
// uiapi.<Object>Create.Record with the same { value } wrapper for scalars.
const CREATE_ACCOUNT = gql`
  mutation CreateAccount($input: AccountCreateInput!) {
    uiapi {
      AccountCreate(input: $input) {
        Record {
          Id
          Name {
            value
          }
        }
      }
    }
  }
`;

interface CreateAccountResponse {
  uiapi: {
    AccountCreate: {
      Record: { Id: string; Name: { value: string | null } | null } | null;
    };
  };
}

export default function CreateRecord() {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ Id: string; Name?: string | null }>();
  const [error, setError] = useState<string>();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(undefined);
    setResult(undefined);

    try {
      const sdk = await createDataSDK();
      const res = await sdk.graphql?.<CreateAccountResponse>(CREATE_ACCOUNT, {
        input: { Account: { Name: name.trim() } },
      });

      if (res?.errors?.length) {
        throw new Error(res.errors.map((e: { message: string }) => e.message).join('; '));
      }

      const record = res?.data.uiapi?.AccountCreate?.Record;
      if (!record) throw new Error('No record returned from AccountCreate');

      setResult({ Id: record.Id, Name: record.Name?.value });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setName('');
    setResult(undefined);
    setError(undefined);
  }

  return (
    <div className="flex flex-col gap-4">
      {result && (
        <div
          className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-emerald-700"
          role="status"
        >
          <span className="sr-only">success</span>
          <div>
            <p className="text-lg font-semibold">Account created</p>
            <p className="text-xs">
              <strong>{result.Name}</strong> &mdash; ID:{' '}
              <code>{result.Id}</code>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          className="rounded-md bg-rose-50 border border-rose-200 p-4 text-rose-700"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-1 mb-2">
          <label className="text-sm font-medium" htmlFor="account-name">
            <span className="text-destructive">*</span>
            {' '}Account Name
          </label>
          <div>
            <Input
              id="account-name"
              type="text"
              placeholder="e.g. Acme Corp"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={submitting || !name.trim()}
          >
            {submitting ? 'Creating…' : 'Create Account'}
          </Button>
          {result && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
            >
              Create Another
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
