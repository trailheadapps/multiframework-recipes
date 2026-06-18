/**
 * Receive Data
 *
 * Listens for UI props pushed from the Salesforce LWC host. The host LWC
 * sets properties on <lightning-embedding> (e.g. recordId, name) and the SDK
 * makes them available via viewSDK.getUiProps().
 *
 * Key concept: viewSDK.getUiProps() returns { props, subscribe }. The
 * props promise resolves with the initial snapshot; the subscribe callback
 * fires every time the host updates any prop. Always call the unsubscribe
 * function in cleanup so stale handlers don't leak after unmount.
 *
 * @see SendEvent — dispatching events back to the host
 */
import { useEffect, useState } from 'react';
import { useSdk } from '../sdk-context';

export default function ReceiveData() {
    const { view, chat } = useSdk();
    const [hostData, setHostData] = useState<Record<string, unknown>>({});
    const [updateCount, setUpdateCount] = useState(0);
    const connected = Object.keys(chat.getHostContext?.() ?? {}).length > 0;

    useEffect(() => {
        // Fallback for hosts that pass data via URL query params (e.g. the
        // mfeReceiveData LWC re-mounts <lightning-embedding> with a new src
        // since src is session-binding). URLSearchParams is read-once.
        const params = new URLSearchParams(window.location.search);
        if ([...params.keys()].length > 0) {
            setHostData(Object.fromEntries(params.entries()));
            setUpdateCount(c => c + 1);
        }

        const uiProps = view.getUiProps?.();
        if (!uiProps) return;

        let unsubscribe: (() => void) | undefined;

        uiProps.props.then(initial => {
            if (Object.keys(initial).length > 0) {
                setHostData(initial);
                setUpdateCount(c => c + 1);
            }
        });

        // subscribe() fires on every host-side prop update. Capture the
        // returned unsubscribe (when the SDK provides one) for cleanup.
        const result = uiProps.subscribe(next => {
            setHostData(next);
            setUpdateCount(c => c + 1);
        }) as unknown;
        if (typeof result === 'function') unsubscribe = result as () => void;

        return () => unsubscribe?.();
    }, [view]);

    const hasData = Object.keys(hostData).length > 0;

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">Receive Data</h2>
            <p className="recipe-description">
                Displays UI props pushed from the Salesforce host. The host LWC sets
                properties on <code>&lt;lightning-embedding&gt;</code>; the SDK delivers
                them via <code>viewSDK.getUiProps()</code>.
            </p>

            {!connected && (
                <div className="recipe-alert alert-info">
                    Running standalone — no host data will arrive. Embed this app in the
                    mfeReceiveData LWC to see live data.
                </div>
            )}

            <div className="recipe-card">
                <p className="recipe-label">Updates received</p>
                <p className="recipe-value">{updateCount}</p>

                <p className="recipe-label">Latest payload</p>
                {hasData ? (
                    <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace' }}>
                        {JSON.stringify(hostData, null, 2)}
                    </pre>
                ) : (
                    <p className="recipe-value" style={{ color: '#9ca3af' }}>
                        Waiting for host data…
                    </p>
                )}
            </div>
        </div>
    );
}
