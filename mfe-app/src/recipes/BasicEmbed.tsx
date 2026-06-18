/**
 * Basic Embed
 *
 * The minimum viable MFE. Resolves the Platform SDK once at app startup and
 * renders the connection state plus the host context the SDK was given.
 *
 * On the Salesforce side the host LWC declares <lightning-embedding> pointing
 * at this route. The SDK auto-initialises via the side-effect import in
 * main.tsx before any component renders.
 *
 * Key concept: createChatSDK() / createViewSDK() resolve once on app load.
 * The result is shared via SdkProvider so every recipe consumes the same
 * instance. When running standalone (no iframe), the SDKs still resolve but
 * most methods are no-ops; surface detection drops to "WebApp".
 *
 * @see ReceiveData — receiving host data via viewSDK.getUiProps()
 */
import { useSdk } from '../sdk-context';

export default function BasicEmbed() {
    const { chat } = useSdk();
    const hostContext = chat.getHostContext?.() ?? {};
    const connected = Object.keys(hostContext).length > 0;

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">Basic Embed</h2>
            <p className="recipe-description">
                Detects whether this React app is running inside a Salesforce{' '}
                <code>&lt;lightning-embedding&gt;</code> iframe.
            </p>

            <div className="recipe-card">
                <p className="recipe-label">SDK status</p>
                <p className="recipe-value">
                    <span className={`status-dot ${connected ? 'dot-green' : 'dot-gray'}`} />
                    {connected ? 'Connected — running inside Salesforce' : 'Not connected — running standalone'}
                </p>

                <p className="recipe-label">Host context</p>
                {connected ? (
                    <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace' }}>
                        {JSON.stringify(hostContext, null, 2)}
                    </pre>
                ) : (
                    <p className="recipe-value" style={{ color: '#9ca3af' }}>—</p>
                )}
            </div>
        </div>
    );
}
