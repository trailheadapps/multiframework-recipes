/**
 * Unsaved Changes — editable form over host Account props.
 *
 * Calls viewSDK.markDirtyState() when the form diverges from the host's
 * saved values and clearDirtyState() when they match again. Salesforce
 * shows a Save/Discard toolbar on the record page and warns before
 * navigation while dirty.
 *
 * Save dispatches `guestsave`; the host writes to Salesforce and pushes
 * fresh values back through ui-state. The Save button stays clickable
 * throughout. An in-flight ref prevents rapid re-clicks from firing
 * duplicate updateRecords, and a short timeout releases that guard if the
 * host's save fails (it toasts without re-emitting), so Save never sticks.
 *
 * @see SendToHost, ReadHostData
 */
import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { getViewSDK } from '@salesforce/platform-sdk';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Rating = 'Hot' | 'Warm' | 'Cold';

interface AccountProps {
  recordId?: string;
  name?: string | null;
  rating?: Rating | null;
  type?: string | null;
}

const RATINGS: Rating[] = ['Hot', 'Warm', 'Cold'];
const TYPES = [
  'Prospect',
  'Customer - Direct',
  'Customer - Channel',
  'Channel Partner / Reseller',
  'Technology Partner',
];

export default function UnsavedChanges() {
  const [saved, setSaved] = useState<AccountProps>({});
  const [form, setForm] = useState<AccountProps>({});
  // Seeded once the host sends a payload with a recordId; keeps the form
  // in sync with subsequent host echoes only if the user hasn't edited yet.
  const seededRef = useRef(false);
  // Prevents rapid Save re-clicks from firing duplicate updateRecords.
  // The button stays clickable so its state doesn't dirty → clean → dirty
  // flicker while the host round-trips.
  const savingRef = useRef(false);
  // Failsafe timer: releases `savingRef` if the host never echoes back
  // (e.g. its updateRecord failed), so a failed save doesn't lock the button.
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    getViewSDK().then(sdk => {
      if (cancelled) return;
      const ui = sdk.getUiState?.();
      if (!ui) return;
      const seed = (p: AccountProps) => {
        setSaved(p);
        if (!seededRef.current && p.recordId) {
          setForm(p);
          seededRef.current = true;
        }
      };
      seed(ui.state.props as AccountProps);
      unsubscribe = ui.subscribe(latest => {
        seed(latest.props as AccountProps);
        // Host echoed fresh values → the save round-trip completed.
        savingRef.current = false;
        if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      });
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const isDirty =
    form.name !== saved.name ||
    form.rating !== saved.rating ||
    form.type !== saved.type;
  const connected = Boolean(saved.recordId);

  useEffect(() => {
    if (!seededRef.current) return;
    getViewSDK().then(sdk => {
      if (isDirty) void sdk.markDirtyState?.();
      else void sdk.clearDirtyState?.();
    });
  }, [isDirty]);

  function set<K extends keyof AccountProps>(key: K, value: AccountProps[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (savingRef.current) return;
    savingRef.current = true;
    // Event name is all-lowercase with no hyphens so the host LWC can
    // bind it declaratively (`onguestsave={handleSave}` on the outer div).
    const sdk = await getViewSDK();
    sdk.dispatchEvent?.(
      new CustomEvent('guestsave', {
        detail: { name: form.name, rating: form.rating, type: form.type },
        bubbles: true,
      }),
    );
    // The host normally releases the guard by echoing fresh values via
    // ui-state. If its updateRecord fails (it surfaces a toast and doesn't
    // re-emit), release after a short delay so a failed save can be retried.
    saveTimeoutRef.current = window.setTimeout(() => {
      savingRef.current = false;
    }, 4000);
  }

  function handleDiscard() {
    setForm(saved);
  }

  return (
    <div className="p-1">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Edit Account</CardTitle>
          <CardDescription>
            {connected
              ? 'Edit any field. Watch the host badge track your changes.'
              : 'Drop this component on an Account record page to edit.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <label htmlFor="unsaved-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="unsaved-name"
              type="text"
              value={form.name ?? ''}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="unsaved-rating" className="text-sm font-medium">
              Rating
            </label>
            <Select
              value={form.rating ?? ''}
              onValueChange={value => set('rating', value as Rating)}
            >
              <SelectTrigger id="unsaved-rating" className="w-full">
                <SelectValue placeholder="Choose rating" />
              </SelectTrigger>
              <SelectContent>
                {RATINGS.map(r => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="unsaved-type" className="text-sm font-medium">
              Type
            </label>
            <Select
              value={form.type ?? ''}
              onValueChange={value => set('type', value)}
            >
              <SelectTrigger id="unsaved-type" className="w-full">
                <SelectValue placeholder="Choose type" />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map(t => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleDiscard}>
              Discard
            </Button>
          </div>
        </CardContent>
      </Card>
      <a
        href="https://github.com/trailheadapps/multiframework-recipes/blob/main/force-app/main/react-recipes/uiBundles/reactRecipes/src/recipes/embedding/UnsavedChanges.tsx"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary mt-3 inline-flex items-center gap-1 text-xs"
      >
        Guest (UnsavedChanges.tsx)
        <ExternalLink className="size-3" aria-hidden />
      </a>
    </div>
  );
}
