/**
 * Receive Data
 *
 * Listens for data pushed from the Salesforce LWC host via updateData().
 * The host calls shell.updateData({ recordId, name }) after @wire(getRecord)
 * resolves — this component receives and displays that payload.
 *
 * Key concept: bridge.addEventListener('data', handler) fires every time
 * the host calls updateData(). The event detail is the exact object passed
 * to updateData(). Always remove the listener in the cleanup function to
 * prevent stale handlers after unmount.
 *
 * @see SendEvent — dispatching events back to the host
 */
import { useEffect, useState } from 'react';
import bridge from '@salesforce/experimental-mfe-bridge';

interface HostData {
    recordId?: string;
    name?: string;
    [key: string]: unknown;
}

export default function ReceiveData() {
    const [hostData, setHostData] = useState<HostData>({});
    const [updateCount, setUpdateCount] = useState(0);
    const [connected, setConnected] = useState(bridge.isConnected());

    useEffect(() => {
        const handleData = (e: Event) => {
            const detail = (e as CustomEvent<HostData>).detail ?? {};
            setHostData(detail);
            setUpdateCount(c => c + 1);
        };
        const handleConnected = () => setConnected(bridge.isConnected());

        // 'data' fires whenever the host calls shell.updateData(payload)
        bridge.addEventListener('data', handleData);
        // 'connected' fires once the bridge handshake completes — re-render
        // so the "running standalone" banner clears when we're embedded.
        bridge.addEventListener('connected', handleConnected);
        handleConnected();
        return () => {
            bridge.removeEventListener('data', handleData);
            bridge.removeEventListener('connected', handleConnected);
        };
    }, []);

    const hasData = Object.keys(hostData).length > 0;

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">
                Receive Data
                <span
                    className={`status-dot ${connected ? 'dot-green' : 'dot-gray'}`}
                    title={connected ? 'Connected to Salesforce host' : 'Running standalone'}
                    style={{ marginLeft: 8 }}
                />
            </h2>
            <p className="recipe-description">
                Displays data pushed from the Salesforce host via{' '}
                <code>shell.updateData()</code>. Interact with the host component to
                trigger an update.
            </p>

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
