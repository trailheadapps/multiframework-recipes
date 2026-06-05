/**
 * Dirty State
 *
 * Notifies the Salesforce host when this MFE has unsaved changes. The host
 * listens for the 'trackdirtystate' event on the shell element and can use
 * it to block tab navigation or show a "You have unsaved changes" warning.
 *
 * Key concept: dispatch a 'trackdirtystate' CustomEvent with
 * { isDirty: boolean, label: string } whenever the form state changes.
 * Set isDirty: false when the user saves or discards changes.
 *
 * @see SendEvent — dispatching generic events to the host
 */
import { useState, useEffect } from 'react';
import bridge from '@salesforce/experimental-mfe-bridge';

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
    const [form, setForm] = useState<FormState>(INITIAL);
    const [saved, setSaved] = useState<FormState>(INITIAL);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const dirty = isDirtyCheck(form, saved);
        setIsDirty(dirty);

        // Notify the Salesforce host whenever dirty state changes.
        // The host uses this to show a warning before the user navigates away.
        bridge.dispatchEvent(
            new CustomEvent('trackdirtystate', {
                detail: {
                    isDirty: dirty,
                    label: dirty ? 'Loan application has unsaved changes' : '',
                },
            }),
        );
    }, [form, saved]);

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
                <code>bridge.dispatchEvent('trackdirtystate')</code>. The host can block
                navigation until the user saves or discards.
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
