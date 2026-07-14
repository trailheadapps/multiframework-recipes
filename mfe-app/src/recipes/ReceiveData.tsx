/**
 * Receive Data
 *
 * Listens for UI props pushed from the Salesforce LWC host. The host LWC
 * sets properties on <lightning-embedding> (e.g. recordId, name) and the SDK
 * makes them available via viewSDK.getUiState().
 *
 * Key concept: viewSDK.getUiState() returns { state, subscribe } synchronously.
 * `state` is the latest cached { props, styles } snapshot. `subscribe(handler)`
 * fires on every subsequent host push and returns an unsubscribe function —
 * always call it in cleanup so stale handlers don't leak after unmount.
 *
 * @see SendEvent — dispatching events back to the host
 */
import { useEffect, useState } from 'react';
import { isSfEmbeddingIframe } from '@salesforce/platform-sdk';
import { useSdk } from '../sdk-context';

export default function ReceiveData() {
    const { view } = useSdk();
    const [hostData, setHostData] = useState<Record<string, unknown>>({});
    const [updateCount, setUpdateCount] = useState(0);
    const connected = isSfEmbeddingIframe();

    useEffect(() => {
        // Fallback for hosts that pass data via URL query params (e.g. the
        // mfeReceiveData LWC re-mounts <lightning-embedding> with a new src
        // since src is session-binding). URLSearchParams is read-once.
        const params = new URLSearchParams(window.location.search);
        if ([...params.keys()].length > 0) {
            setHostData(Object.fromEntries(params.entries()));
            setUpdateCount(c => c + 1);
        }

        const uiState = view.getUiState?.();
        if (!uiState) return;

        if (Object.keys(uiState.state.props).length > 0) {
            setHostData(uiState.state.props);
            setUpdateCount(c => c + 1);
        }

        const unsubscribe = uiState.subscribe(next => {
            setHostData(next.props);
            setUpdateCount(c => c + 1);
        });

        return () => unsubscribe();
    }, [view]);

    const hasData = Object.keys(hostData).length > 0;

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">Receive Data</h2>
            <p className="recipe-description">
                Displays UI props pushed from the Salesforce host. The host LWC sets
                properties on <code>&lt;lightning-embedding&gt;</code>; the SDK delivers
                them via <code>viewSDK.getUiState()</code>.
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
