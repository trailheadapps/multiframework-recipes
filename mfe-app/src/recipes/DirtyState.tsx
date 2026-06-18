/**
 * Dirty State
 *
 * Notifies the Salesforce host when this MFE has unsaved changes. The host
 * may show a "you have unsaved changes" warning before navigation.
 *
 * Key concept: viewSDK.markDirtyState() and viewSDK.clearDirtyState() are
 * the explicit dirty-state API. Call markDirtyState() whenever the form
 * mutates and clearDirtyState() after a successful save (or discard). The
 * host decides how to surface the state — typically a navigation guard.
 *
 * @see SendEvent — dispatching generic events to the host
 */
import { useEffect, useState } from 'react';
import { useSdk } from '../sdk-context';

interface FormState {
    name: string;
    amount: string;
    notes: string;
}

const INITIAL: FormState = { name: '', amount: '', notes: '' };

function isDirtyCheck(current: FormState, saved: FormState) {
    return JSON.stringify(current) !== JSON.stringify(saved);
}

export default function DirtyState() {
    const { view } = useSdk();
    const [form, setForm] = useState<FormState>(INITIAL);
    const [saved, setSaved] = useState<FormState>(INITIAL);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const dirty = isDirtyCheck(form, saved);
        setIsDirty(dirty);

        if (dirty) {
            void view.markDirtyState?.();
        } else {
            void view.clearDirtyState?.();
        }
    }, [form, saved, view]);

    function handleChange(field: keyof FormState, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function handleSave() {
        setSaved(form);
    }

    function handleDiscard() {
        setForm(saved);
    }

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">Dirty State</h2>
            <p className="recipe-description">
                Edit the form — the host is notified of unsaved changes via{' '}
                <code>viewSDK.markDirtyState()</code> and cleared with{' '}
                <code>clearDirtyState()</code> on save.
            </p>

            {isDirty && (
                <div className="recipe-alert alert-warning">
                    Unsaved changes — the Salesforce host has been notified.
                </div>
            )}

            {!isDirty && saved.name && (
                <div className="recipe-alert alert-success">Changes saved.</div>
            )}

            <div className="recipe-card" style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 10 }}>
                    <p className="recipe-label" style={{ marginBottom: 4 }}>Applicant name</p>
                    <input
                        className="recipe-input"
                        value={form.name}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="e.g. Jane Doe"
                    />
                </label>
                <label style={{ display: 'block', marginBottom: 10 }}>
                    <p className="recipe-label" style={{ marginBottom: 4 }}>Loan amount</p>
                    <input
                        className="recipe-input"
                        value={form.amount}
                        onChange={e => handleChange('amount', e.target.value)}
                        placeholder="e.g. 250000"
                    />
                </label>
                <label style={{ display: 'block', marginBottom: 10 }}>
                    <p className="recipe-label" style={{ marginBottom: 4 }}>Notes</p>
                    <input
                        className="recipe-input"
                        value={form.notes}
                        onChange={e => handleChange('notes', e.target.value)}
                        placeholder="Optional notes"
                    />
                </label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    className="recipe-btn recipe-btn-primary"
                    onClick={handleSave}
                    disabled={!isDirty}
                >
                    Save
                </button>
                <button
                    className="recipe-btn recipe-btn-secondary"
                    onClick={handleDiscard}
                    disabled={!isDirty}
                >
                    Discard
                </button>
            </div>
        </div>
    );
}
