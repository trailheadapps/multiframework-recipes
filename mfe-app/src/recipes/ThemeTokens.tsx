/**
 * Theme Tokens
 *
 * Reads the host theme via viewSDK.getTheme() and the broader host context
 * via chatSDK.getHostContext(). Applies the theme mode to a CSS class on
 * the document root so styles cascade through the whole MFE.
 *
 * Key concept: getTheme() returns { mode: 'light' | 'dark' } or null when
 * the host hasn't supplied a theme. getHostContext() also exposes locale,
 * userAgent, displayMode, and host-provided styles. Re-read on demand —
 * the host pushes updates through getUiProps(), so subscribe there if you
 * need live theme refreshes.
 *
 * @see DirtyState — notifying the host about unsaved changes
 */
import { useEffect, useState } from 'react';
import { useSdk } from '../sdk-context';

export default function ThemeTokens() {
    const { view, chat } = useSdk();
    const [mode, setMode] = useState<string | null>(null);
    const [hostContext, setHostContext] = useState<Record<string, unknown>>({});
    const connected = Object.keys(chat.getHostContext?.() ?? {}).length > 0;

    useEffect(() => {
        const theme = view.getTheme?.();
        setMode(theme?.mode ?? null);
        setHostContext({ ...(chat.getHostContext?.() ?? {}) });

        if (theme?.mode) {
            document.documentElement.dataset.theme = theme.mode;
        }
    }, [view, chat]);

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">Theme Tokens</h2>
            <p className="recipe-description">
                Reads the host theme via <code>viewSDK.getTheme()</code> and the broader
                environment via <code>chatSDK.getHostContext()</code>. Apply the result
                to your styles however you like.
            </p>

            {!connected && (
                <div className="recipe-alert alert-info">
                    Running standalone — no theme data will arrive from a host.
                </div>
            )}

            <div className="recipe-card">
                <p className="recipe-label">Theme mode</p>
                <p className="recipe-value" style={{ fontFamily: 'monospace' }}>
                    {mode ?? '—'}
                </p>

                <p className="recipe-label">Host context</p>
                {Object.keys(hostContext).length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: 13 }}>No host context yet.</p>
                ) : (
                    <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace' }}>
                        {JSON.stringify(hostContext, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
}
