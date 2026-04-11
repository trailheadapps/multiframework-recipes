/**
 * Programmatic Navigation (useNavigate)
 *
 * useNavigate() returns an imperative navigate function. Call it anywhere in
 * component logic, such as redirecting after a form submission.
 *
 * LWC equivalent: NavigationMixin.Navigate() with a typed page reference
 * object. React Router's useNavigate() is simpler — just pass a URL string.
 *
 * Enter a name and submit — after a simulated save, the app navigates
 * to /read-data automatically.
 *
 * @see SearchableAccountList — combining search, debounce, and data fetching
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


export default function UseNavigate() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('saving');

    // Simulate an async operation such as a GraphQL mutation
    await new Promise<void>(resolve => setTimeout(resolve, 1200));
    setStatus('done');

    // Navigate to another page once the action completes
    setTimeout(() => navigate('/read-data'), 900);
  }

  return (
    <div className="flex flex-col gap-4">
      {status === 'done' ? (
        <div
          className="rounded-md bg-emerald-50 border border-emerald-200 p-4"
          role="status"
        >
          <p className="text-sm text-emerald-700">
            <strong>"{name}"</strong> created — navigating to Read Data…
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nav-name" className="text-sm font-medium">Account Name</label>
            <Input
              id="nav-name"
              type="text"
              placeholder="Enter a name"
              value={name}
              required
              onChange={e => setName(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={status === 'saving'}
          >
            {status === 'saving' ? 'Saving…' : 'Create & Navigate'}
          </Button>
        </form>
      )}

      <div
        className="rounded-md bg-muted p-4 text-xs"
        style={{ borderLeft: '3px solid var(--primary)' }}
      >
        <p className="mb-1">
          <strong>navigate() options:</strong>
        </p>
        <ul className="list-disc pl-5">
          <li>
            <code>navigate('/path')</code> — push onto history stack
          </li>
          <li>
            <code>{"navigate('/path', { replace: true })"}</code> — replace
            current entry (no Back)
          </li>
          <li>
            <code>navigate(-1)</code> — go back
          </li>
          <li>
            <code>navigate(1)</code> — go forward
          </li>
        </ul>
      </div>
    </div>
  );
}
