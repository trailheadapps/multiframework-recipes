/**
 * Send Event
 *
 * Dispatches a custom event from the MFE back to the Salesforce LWC host.
 * The host listens on the embedding element:
 *   shell.addEventListener('mfe-action', handler)
 *
 * Key concept: viewSDK is a DOM EventTarget. Call
 *   view.dispatchEvent(new CustomEvent(name, { detail: data }))
 * to forward the event over the wire to the parent LWC. The host catches it
 * as a DOM event on the embedding element, and event.detail carries the
 * payload. Local listeners registered via view.addEventListener() also fire.
 *
 * @see ReceiveData — receiving data pushed from the host
 */
import { useState } from 'react';
import { isSfEmbeddingIframe } from '@salesforce/platform-sdk';
import { useSdk } from '../sdk-context';

const ACTIONS = ['approve', 'reject', 'request-docs', 'escalate'] as const;
type Action = (typeof ACTIONS)[number];

interface EventLog {
    action: Action;
    timestamp: string;
}

export default function SendEvent() {
    const { view } = useSdk();
    const [log, setLog] = useState<EventLog[]>([]);
    const connected = isSfEmbeddingIframe();

    function handleAction(action: Action) {
        // dispatchEvent forwards the CustomEvent's detail to the host LWC.
        // The host listens: shell.addEventListener('mfe-action', handler)
        view.dispatchEvent?.(
            new CustomEvent('mfe-action', {
                detail: { action, timestamp: Date.now() },
                bubbles: true,
                composed: true,
            }),
        );

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
