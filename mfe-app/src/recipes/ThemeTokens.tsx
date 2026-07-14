/**
 * Theme Tokens
 *
 * Reads the host theme via viewSDK.getTheme() and the broader host UI state
 * via viewSDK.getUiState(). Applies the theme mode to a data attribute on
 * the document root so styles cascade through the whole MFE.
 *
 * Key concept: getTheme() returns { mode: 'light' | 'dark' } or null when
 * the host hasn't supplied a theme. getUiState() returns { state, subscribe }
 * synchronously; state.styles carries the CSS variables and attributes the
 * host mirrors onto the surface, and subscribe() fires on every host push.
 *
 * @see DirtyState — notifying the host about unsaved changes
 */
import { useEffect, useState } from 'react';
import { isSfEmbeddingIframe, type UiStyles } from '@salesforce/platform-sdk';
import { useSdk } from '../sdk-context';

export default function ThemeTokens() {
    const { view } = useSdk();
    const [mode, setMode] = useState<string | null>(null);
    const [styles, setStyles] = useState<UiStyles>({});
    const connected = isSfEmbeddingIframe();

    useEffect(() => {
        const theme = view.getTheme?.();
        setMode(theme?.mode ?? null);
        if (theme?.mode) {
            document.documentElement.dataset.theme = theme.mode;
        }

        const uiState = view.getUiState?.();
        if (!uiState) return;

        setStyles(uiState.state.styles);
        const unsubscribe = uiState.subscribe(next => setStyles(next.styles));
        return () => unsubscribe();
    }, [view]);

    const hasStyles =
        Object.keys(styles.variables ?? {}).length > 0 ||
        Object.keys(styles.attributes ?? {}).length > 0;

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">Theme Tokens</h2>
            <p className="recipe-description">
                Reads the host theme via <code>viewSDK.getTheme()</code> and mirrored
                CSS variables/attributes via <code>viewSDK.getUiState().state.styles</code>.
                Apply the result to your styles however you like.
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

                <p className="recipe-label">Host styles</p>
                {!hasStyles ? (
                    <p style={{ color: '#9ca3af', fontSize: 13 }}>No host styles yet.</p>
                ) : (
                    <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace' }}>
                        {JSON.stringify(styles, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
}
