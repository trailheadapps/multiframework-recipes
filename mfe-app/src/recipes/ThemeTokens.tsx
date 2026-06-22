/**
 * Theme Tokens
 *
 * Receives Salesforce CSS custom properties (design tokens) from the host
 * and applies them to the UI. The bridge sends all --slds-* properties from
 * the lwc-shell element automatically on connect, and again whenever the host
 * calls shell.refreshTheme().
 *
 * Key concept: bridge.addEventListener('theme', handler) receives a map of
 * CSS custom property names to values. Apply them to document.documentElement
 * via setProperty() so they cascade to the whole app. The bridge does this
 * automatically — this recipe makes the process explicit and visible.
 *
 * @see DirtyState — notifying the host about unsaved changes
 */
import { useEffect, useState } from 'react';
import bridge from '@salesforce/experimental-mfe-bridge';

interface ThemeData {
    [property: string]: string;
}

export default function ThemeTokens() {
    const [tokens, setTokens] = useState<ThemeData>({});
    const [syncCount, setSyncCount] = useState(0);
    const [connected, setConnected] = useState(bridge.isConnected());

    useEffect(() => {
        const handleTheme = (e: Event) => {
            const detail = (e as CustomEvent<ThemeData>).detail ?? {};

            // Apply every CSS custom property to the document root so they
            // cascade to all components in this MFE.
            Object.entries(detail).forEach(([prop, value]) => {
                document.documentElement.style.setProperty(prop, value);
            });

            setTokens(detail);
            setSyncCount(c => c + 1);
        };
        const handleConnected = () => setConnected(bridge.isConnected());

        // 'theme' fires on connect and whenever the host calls shell.refreshTheme()
        bridge.addEventListener('theme', handleTheme);
        // 'connected' fires once after the host's salesforce-shell-ready arrives;
        // subscribe so the "running standalone" banner clears post-handshake.
        bridge.addEventListener('connected', handleConnected);
        handleConnected();
        return () => {
            bridge.removeEventListener('theme', handleTheme);
            bridge.removeEventListener('connected', handleConnected);
        };
    }, []);

    const tokenEntries = Object.entries(tokens).slice(0, 20);

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">
                Theme Tokens
                <span
                    className={`status-dot ${connected ? 'dot-green' : 'dot-gray'}`}
                    title={connected ? 'Connected to Salesforce host' : 'Running standalone'}
                    style={{ marginLeft: 8 }}
                />
            </h2>
            <p className="recipe-description">
                Displays Salesforce CSS custom properties received from the host.
                The host sends them automatically; call{' '}
                <code>shell.refreshTheme()</code> to re-sync after a theme change.
            </p>

            <div className="recipe-card">
                <p className="recipe-label">Syncs received: {syncCount}</p>
                <p className="recipe-label">Tokens (first 20 of {Object.keys(tokens).length})</p>

                {tokenEntries.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: 13 }}>Waiting for theme data…</p>
                ) : (
                    <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '4px 8px 4px 0', color: '#888' }}>Property</th>
                                <th style={{ textAlign: 'left', padding: '4px 0', color: '#888' }}>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tokenEntries.map(([prop, value]) => (
                                <tr key={prop}>
                                    <td style={{ padding: '2px 8px 2px 0', fontFamily: 'monospace', color: '#0a7cae' }}>{prop}</td>
                                    <td style={{ padding: '2px 0', fontFamily: 'monospace' }}>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
