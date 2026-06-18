/**
 * Send Event
 *
 * Dispatches a custom event from the MFE back to the Salesforce LWC host.
 * The host listens on the embedding element:
 *   shell.addEventListener('mfe-action', handler)
 *
 * Key concept: viewSDK.dispatchEvent(name, data) sends the event through
 * <lightning-embedding> to the parent LWC. The host catches it as a DOM
 * event on the embedding element. The data argument is any serialisable
 * key/value bag and lands on event.detail.
 *
 * @see ReceiveData — receiving data pushed from the host
 */
import { useState } from 'react';
import { useSdk } from '../sdk-context';

const ACTIONS = ['approve', 'reject', 'request-docs', 'escalate'] as const;
type Action = (typeof ACTIONS)[number];

interface EventLog {
    action: Action;
    timestamp: string;
}

export default function SendEvent() {
    const { view, chat } = useSdk();
    const [log, setLog] = useState<EventLog[]>([]);
    const connected = Object.keys(chat.getHostContext?.() ?? {}).length > 0;

    async function handleAction(action: Action) {
        // dispatchEvent forwards (name, data) to the host LWC.
        // The host listens: shell.addEventListener('mfe-action', handler)
        await view.dispatchEvent?.('mfe-action', { action, timestamp: Date.now() });

        setLog(prev => [
            { action, timestamp: new Date().toLocaleTimeString() },
            ...prev.slice(0, 9),
        ]);
    }

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">Send Event</h2>
            <p className="recipe-description">
                Dispatches custom events to the Salesforce LWC host via{' '}
                <code>viewSDK.dispatchEvent()</code>. The host receives them on the
                embedding element.
            </p>

            {!connected && (
                <div className="recipe-alert alert-info">
                    Running standalone — events are dispatched but no host is listening.
                </div>
            )}

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
