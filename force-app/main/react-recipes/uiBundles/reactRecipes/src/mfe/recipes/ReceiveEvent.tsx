/**
 * Receive Event
 *
 * Listens for custom events pushed from the Salesforce LWC host — the mirror
 * of Send Event. The host dispatches a CustomEvent on the
 * <lightning-ui-embedding> element; the bridge forwards it over the wire and
 * the SDK re-dispatches it locally, so viewSDK.addEventListener() hears it.
 *
 * Key concept: viewSDK is a DOM EventTarget. Register with
 *   view.addEventListener(name, handler)
 * and every host push of that event name fires the handler with the payload on
 * event.detail. Always remove the listener on unmount so stale handlers don't
 * leak — registering a listener is also what tells the host it has a subscriber
 * (the host only forwards events while at least one listener is attached).
 *
 * @see SendEvent — dispatching events from the guest to the host
 */
import { useEffect, useState } from 'react';
import { isSfEmbeddingIframe } from '@salesforce/platform-sdk';
import { useSdk } from '../sdk-context';

// The host pushes this event name; keep it in sync with the mfeReceiveEvent LWC.
const HOST_EVENT = 'host-notify';

interface EventLog {
    message: string;
    receivedAt: string;
}

export default function ReceiveEvent() {
    const { view } = useSdk();
    const [log, setLog] = useState<EventLog[]>([]);
    const connected = isSfEmbeddingIframe();

    useEffect(() => {
        if (!view.addEventListener) return;

        // Host → guest: every dispatch of `host-notify` from the LWC lands here.
        const handler = (evt: Event) => {
            const detail = ((evt as CustomEvent).detail ?? {}) as { message?: string };
            setLog(prev => [
                {
                    message: typeof detail.message === 'string' ? detail.message : '(no payload)',
                    receivedAt: new Date().toLocaleTimeString(),
                },
                ...prev.slice(0, 9),
            ]);
        };

        view.addEventListener(HOST_EVENT, handler);
        return () => view.removeEventListener?.(HOST_EVENT, handler);
    }, [view]);

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">Receive Event</h2>
            <p className="recipe-description">
                Listens for <code>{HOST_EVENT}</code> events pushed from the Salesforce
                host via <code>viewSDK.addEventListener()</code>. Click the button in the
                LWC host — each event arrives with its payload on{' '}
                <code>event.detail</code>.
            </p>

            {!connected && (
                <div className="recipe-alert alert-info">
                    Running standalone — no host is pushing events. Embed this app in the
                    mfeReceiveEvent LWC to see live events.
                </div>
            )}

            <div className="recipe-card">
                <p className="recipe-label">Events received</p>
                <p className="recipe-value">{log.length}</p>

                <p className="recipe-label">History</p>
                {log.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                        {log.map((entry, i) => (
                            <li key={i} style={{ marginBottom: 4 }}>
                                <code>{entry.message}</code>
                                <span style={{ color: '#9ca3af', marginLeft: 8 }}>
                                    {entry.receivedAt}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="recipe-value" style={{ color: '#9ca3af' }}>
                        Waiting for host events…
                    </p>
                )}
            </div>
        </div>
    );
}
