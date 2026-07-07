/**
 * Send Event
 *
 * Dispatches a custom event from the MFE back to the Salesforce LWC host.
 * The host listens on the shell element: shell.addEventListener('mfe-action', handler).
 *
 * Key concept: bridge.dispatchEvent(new CustomEvent(type, { detail })) sends the
 * event through lwc-shell to the parent LWC. The host catches it as a DOM event
 * on the shell element. Any serialisable object is valid as the detail payload.
 *
 * @see ReceiveData — receiving data pushed from the host
 */
import { useEffect, useState } from 'react';
import bridge from '@salesforce/experimental-mfe-bridge';

const ACTIONS = ['approve', 'reject', 'request-docs', 'escalate'] as const;
type Action = (typeof ACTIONS)[number];

interface EventLog {
    action: Action;
    timestamp: string;
}

export default function SendEvent() {
    const [log, setLog] = useState<EventLog[]>([]);
    const [connected, setConnected] = useState(bridge.isConnected());

    useEffect(() => {
        const sync = () => setConnected(bridge.isConnected());
        sync();
        bridge.addEventListener('connected', sync);
        return () => bridge.removeEventListener('connected', sync);
    }, []);

    function handleAction(action: Action) {
        // Dispatch a custom event that bubbles up to the LWC host.
        // The host listens: shell.addEventListener('mfe-action', handler)
        bridge.dispatchEvent(
            new CustomEvent('mfe-action', {
                detail: { action, timestamp: Date.now() },
            }),
        );

        setLog(prev => [
            { action, timestamp: new Date().toLocaleTimeString() },
            ...prev.slice(0, 9),
        ]);
    }

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">
                Send Event
                <span
                    className={`status-dot ${connected ? 'dot-green' : 'dot-gray'}`}
                    title={connected ? 'Connected to Salesforce host' : 'Running standalone'}
                    style={{ marginLeft: 8 }}
                />
            </h2>
            <p className="recipe-description">
                Dispatches custom events to the Salesforce LWC host via{' '}
                <code>bridge.dispatchEvent()</code>. The host receives them on the shell
                element.
            </p>

            <div className="recipe-card" style={{ marginBottom: 12 }}>
                <p className="recipe-label">Actions</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {ACTIONS.map(action => (
                        <button
                            key={action}
                            className="recipe-btn recipe-btn-primary"
                            onClick={() => handleAction(action)}
                        >
                            {action}
                        </button>
                    ))}
                </div>
            </div>

            {log.length > 0 && (
                <div className="recipe-card">
                    <p className="recipe-label">Dispatched events</p>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                        {log.map((entry, i) => (
                            <li key={i} style={{ marginBottom: 4 }}>
                                <code>{entry.action}</code>
                                <span style={{ color: '#9ca3af', marginLeft: 8 }}>
                                    {entry.timestamp}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
