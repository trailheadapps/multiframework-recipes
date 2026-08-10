/**
 * Cancelable Event
 *
 * Some host-pushed events ask the guest to approve an action before the host
 * commits it — e.g. "the user is about to submit; is the form valid?". The host
 * dispatches the event with `cancelable: true`; the guest vetoes by calling
 * `event.preventDefault()`.
 *
 * Key concept — the veto is LOCAL, not a return value. `ui/events/dispatch` is
 * fire-and-forget: calling `preventDefault()` cancels the event only inside the
 * guest document; it does NOT travel back over the wire to the host. To tell the
 * host the outcome, dispatch a reply event with `view.dispatchEvent()`. This
 * recipe answers every `submit-check` with a `submit-decision` event carrying
 * `{ allowed }`.
 *
 * The listener reads live form state via a ref so it never re-subscribes on
 * keystrokes yet always sees the current value.
 *
 * @see ReceiveEvent — plain host → guest events with no reply
 * @see SendEvent — guest → host events
 */
import { useEffect, useRef, useState } from 'react';
import { isSfEmbeddingIframe } from '@salesforce/platform-sdk';
import { useSdk } from '../sdk-context';

// Host asks with `submit-check`; guest answers with `submit-decision`.
const HOST_REQUEST = 'submit-check';
const GUEST_REPLY = 'submit-decision';

interface DecisionLog {
    allowed: boolean;
    reason: string;
    at: string;
}

export default function CancelableEvent() {
    const { view } = useSdk();
    const [name, setName] = useState('');
    const [log, setLog] = useState<DecisionLog[]>([]);
    const connected = isSfEmbeddingIframe();

    // The listener closes over this ref, so it always sees the latest name
    // without re-subscribing on every keystroke.
    const nameRef = useRef(name);
    useEffect(() => {
        nameRef.current = name;
    }, [name]);

    useEffect(() => {
        if (!view.addEventListener) return;

        const handleHostCheck = (evt: Event) => {
            const isValid = nameRef.current.trim().length > 0;

            // Veto locally — cancels the event inside this document only.
            if (!isValid) evt.preventDefault();

            // Round-trip the decision back to the host (preventDefault does not).
            view.dispatchEvent?.(
                new CustomEvent(GUEST_REPLY, {
                    detail: { allowed: isValid },
                    bubbles: true,
                    composed: true,
                }),
            );

            setLog(prev => [
                {
                    allowed: isValid,
                    reason: isValid ? 'name present' : 'name empty — vetoed',
                    at: new Date().toLocaleTimeString(),
                },
                ...prev.slice(0, 9),
            ]);
        };

        view.addEventListener(HOST_REQUEST, handleHostCheck);
        return () => view.removeEventListener?.(HOST_REQUEST, handleHostCheck);
    }, [view]);

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">Cancelable Event</h2>
            <p className="recipe-description">
                The host asks <code>{HOST_REQUEST}</code> before committing an action. This
                guest vetoes with <code>event.preventDefault()</code> when the form is
                invalid, then replies with a <code>{GUEST_REPLY}</code> event carrying the
                decision — because a fire-and-forget event's <code>preventDefault()</code>{' '}
                does not travel back to the host.
            </p>

            {!connected && (
                <div className="recipe-alert alert-info">
                    Running standalone — no host is asking. Embed this app in the
                    mfeCancelableEvent LWC to drive the check.
                </div>
            )}

            <div className="recipe-card" style={{ marginBottom: 12 }}>
                <label style={{ display: 'block' }}>
                    <p className="recipe-label" style={{ marginBottom: 4 }}>
                        Applicant name (empty = host submit will be vetoed)
                    </p>
                    <input
                        className="recipe-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                    />
                </label>
            </div>

            {log.length > 0 && (
                <div className="recipe-card">
                    <p className="recipe-label">Decisions</p>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                        {log.map((entry, i) => (
                            <li key={i} style={{ marginBottom: 4 }}>
                                <span className={`status-dot ${entry.allowed ? 'dot-green' : 'dot-gray'}`} />
                                <code>{entry.allowed ? 'allowed' : 'vetoed'}</code>
                                <span style={{ color: '#9ca3af', marginLeft: 8 }}>
                                    {entry.reason} · {entry.at}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
