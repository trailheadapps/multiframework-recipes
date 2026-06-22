/**
 * Basic Embed
 *
 * The minimum viable MFE. Checks whether the bridge is connected on mount
 * and displays the connection status.
 *
 * On the Salesforce side the host LWC creates an <lwc-shell> pointing at
 * this route. The bridge auto-initialises when this page loads inside that
 * iframe — no explicit setup is needed.
 *
 * Key concept: bridge.isConnected() returns true only when running inside a
 * Salesforce lwc-shell iframe. Use it to detect the embedding context and
 * render accordingly.
 *
 * @see ReceiveData — receiving host data via the bridge
 */
import { useEffect, useState } from 'react';
import bridge from '@salesforce/experimental-mfe-bridge';

export default function BasicEmbed() {
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // The bridge's 'connected' event fires after the host posts
        // `salesforce-shell-ready`. Subscribe — and sync once now in case the
        // round-trip already completed before this component mounted.
        const sync = () => setConnected(bridge.isConnected());
        sync();
        bridge.addEventListener('connected', sync);
        return () => bridge.removeEventListener('connected', sync);
    }, []);

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">Basic Embed</h2>
            <p className="recipe-description">
                Detects whether this React app is running inside a Salesforce lwc-shell iframe.
            </p>

            <div className="recipe-card">
                <p className="recipe-label">Bridge status</p>
                <p className="recipe-value">
                    <span className={`status-dot ${connected ? 'dot-green' : 'dot-gray'}`} />
                    {connected ? 'Connected — running inside Salesforce' : 'Not connected — running standalone'}
                </p>

                <p className="recipe-label">Instance ID</p>
                <p className="recipe-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {connected ? bridge.instanceId : '—'}
                </p>
            </div>
        </div>
    );
}
