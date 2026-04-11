/**
 * Server-Side Error Handling
 *
 * Handles top-level GraphQL errors from a UIAPI mutation.
 * The form intentionally omits the required LastName field so you can
 * submit and observe a REQUIRED_FIELD_MISSING error.
 *
 * Key Concepts:
 * - GraphQL error array parsing: errors live in result.errors[], not thrown
 * - Field-level vs operation-level errors: missing required fields cause
 *   top-level GraphQL errors, not field-level validation messages
 * - Displaying server error messages to the user
 *
 * LWC equivalent: createRecord() rejects its promise with an error object
 * containing body.message and body.output.fieldErrors for field-level detail.
 *
 * @see LoadingErrorEmpty — handling loading, error, and empty UI states
 */
import { useState, type FormEvent } from 'react';
import { createDataSDK, gql } from '@salesforce/sdk-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Typed shape of the mutation response data
type ContactCreateResult = {
  uiapi: {
    ContactCreate: {
      Record?: { Id: string; Name?: { value?: string | null } | null } | null;
    };
  };
};

const CREATE_CONTACT = gql`
  mutation CreateContact($input: ContactCreateInput!) {
    uiapi {
      ContactCreate(input: $input) {
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

export default function ServerErrorHandling() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [topLevelError, setTopLevelError] = useState<string>();
  const [createdId, setCreatedId] = useState<string>();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTopLevelError(undefined);
    setCreatedId(undefined);

    try {
      const sdk = await createDataSDK();
      const result = await sdk.graphql?.<ContactCreateResult>(CREATE_CONTACT, {
        input: {
          Contact: {
            // LastName is intentionally omitted here — it is required by
            // Salesforce, so submitting without it triggers a server error
            Email: email || undefined,
            Phone: phone || undefined,
          },
        },
      });

      // Top-level GraphQL errors (syntax, auth, field validation) live in result.errors
      if (result?.errors?.length) {
        setTopLevelError(result.errors.map((e: { message: string }) => e.message).join('; '));
        return;
      }

      const payload = result?.data.uiapi?.ContactCreate;

      // Success: no top-level errors
      setCreatedId(payload?.Record?.Id);
    } catch (err) {
      setTopLevelError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border-l-4 border-l-primary bg-background p-4 text-xs">
        <strong>What to try:</strong> Submit without filling in any fields.
        Because <code>LastName</code> is required but not included in this form,
        the server will return a top-level GraphQL error in{' '}
        <code>result.errors[]</code>.
      </div>

      {topLevelError && (
        <div
          className="rounded-md bg-rose-50 border border-rose-200 p-4 text-rose-700"
          role="alert"
        >
          <p className="text-xs">
            <strong>GraphQL error:</strong> {topLevelError}
          </p>
        </div>
      )}

      {createdId && (
        <div
          className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-emerald-700"
          role="status"
        >
          <div>
            <p>
              Contact created — ID: <code>{createdId}</code>
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-1 mb-2">
          <label className="text-sm font-medium" htmlFor="err-email">
            Email
          </label>
          <div>
            <Input
              id="err-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <label className="text-sm font-medium" htmlFor="err-phone">
            Phone
          </label>
          <div>
            <Input
              id="err-phone"
              type="tel"
              placeholder="555-555-5555"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting
            ? 'Submitting…'
            : 'Submit (no LastName → triggers server error)'}
        </Button>
      </form>
    </div>
  );
}
