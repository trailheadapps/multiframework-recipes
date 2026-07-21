/**
 * Theme Tokens
 *
 * Reads host-owned theme tokens over the bridge's ui-state channel and mirrors
 * them onto this component's root as CSS custom properties.
 *
 * The host LWC publishes tokens on two channels for version resilience:
 *   - `state.styles.variables` — inline `--*` custom properties (newer base
 *     components), keyed by CSS var name (e.g. "--brand-primary").
 *   - `state.props` — the @api prop bag (every version), keyed camelCase
 *     (e.g. "brandPrimary").
 * We prefer `variables` and fall back to `props`.
 *
 * @see ReceiveData — receiving arbitrary state through `state.props`
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSdk } from '../sdk-context';

// cssVar → prop-bag key. Both channels resolve to the same CSS custom property.
const TOKEN_MAP: ReadonlyArray<{ cssVar: string; prop: string }> = [
    { cssVar: '--brand-primary', prop: 'brandPrimary' },
    { cssVar: '--brand-background', prop: 'brandBackground' },
    { cssVar: '--brand-text', prop: 'brandText' },
    { cssVar: '--brand-radius', prop: 'brandRadius' },
    { cssVar: '--brand-spacing', prop: 'brandSpacing' },
    { cssVar: '--brand-font-size', prop: 'brandFontSize' },
];

const TOKEN_VARS = TOKEN_MAP.map(t => t.cssVar);

function ThemeTokens() {
    const { view } = useSdk();
    const [tokens, setTokens] = useState<Record<string, string>>({});
    const [hostDir, setHostDir] = useState<'ltr' | 'rtl'>('ltr');
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!view.getUiState) return;

        const apply = (state: {
            props?: Record<string, unknown>;
            styles?: { variables?: Record<string, string>; attributes?: Record<string, string> };
        }) => {
            const variables = state.styles?.variables ?? {};
            const props = state.props ?? {};
            const next: Record<string, string> = {};
            for (const { cssVar, prop } of TOKEN_MAP) {
                // Prefer the inline CSS variable; fall back to the prop bag.
                const fromVar = variables[cssVar];
                const fromProp = props[prop];
                const v = typeof fromVar === 'string' && fromVar ? fromVar
                    : typeof fromProp === 'string' && fromProp ? fromProp
                    : undefined;
                if (v) next[cssVar] = v;
            }
            setTokens(next);
            const dir = state.styles?.attributes?.dir;
            if (dir === 'ltr' || dir === 'rtl') setHostDir(dir);
        };

        const { state, subscribe } = view.getUiState();
        apply(state);
        const unsubscribe = subscribe(next => apply(next));
        return () => unsubscribe();
    }, [view]);

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        for (const name of TOKEN_VARS) {
            const value = tokens[name];
            if (value) el.style.setProperty(name, value);
            else el.style.removeProperty(name);
        }
    }, [tokens]);

    const rows = useMemo(
        () => TOKEN_VARS.map(name => ({ key: name, value: tokens[name] ?? '(unset)' })),
        [tokens],
    );

    return (
        <div
            ref={rootRef}
            dir={hostDir}
            style={{
                padding: 'var(--brand-spacing, 16px)',
                borderRadius: 'var(--brand-radius, 8px)',
                background: 'var(--brand-background, #ffffff)',
                color: 'var(--brand-text, #111827)',
                fontSize: 'var(--brand-font-size, 14px)',
                border: '1px solid rgba(0,0,0,0.08)',
                minHeight: '360px',
            }}
        >
            <h2 style={{ margin: 0, color: 'var(--brand-primary, #2563eb)' }}>
                React MicroFrontend - Theme Tokens (SDK)
            </h2>
            <p style={{ margin: '4px 0 0', opacity: 0.75, fontSize: '12px' }}>
                Tokens flow host → iframe via UiState <code>styles.variables</code>.
            </p>

            <div
                style={{
                    marginTop: 'var(--brand-spacing, 16px)',
                    padding: 'var(--brand-spacing, 16px)',
                    borderRadius: 'var(--brand-radius, 8px)',
                    background: 'var(--brand-primary, #2563eb)',
                    color: 'var(--brand-background, #ffffff)',
                    fontWeight: 600,
                }}
            >
                Primary surface — reflects host tokens live.
            </div>

            <button
                type="button"
                style={{
                    marginTop: 'var(--brand-spacing, 16px)',
                    padding: '8px 16px',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--brand-radius, 8px)',
                    background: 'var(--brand-primary, #2563eb)',
                    color: 'var(--brand-background, #ffffff)',
                    fontSize: 'var(--brand-font-size, 14px)',
                }}
            >
                Themed action button
            </button>

            <table
                style={{
                    marginTop: 'var(--brand-spacing, 16px)',
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                }}
            >
                <thead>
                    <tr style={{ textAlign: 'left', opacity: 0.7 }}>
                        <th style={{ padding: '4px 8px' }}>Token</th>
                        <th style={{ padding: '4px 8px' }}>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(r => (
                        <tr key={r.key} style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                            <td style={{ padding: '4px 8px', fontFamily: 'monospace' }}>{r.key}</td>
                            <td style={{ padding: '4px 8px', fontFamily: 'monospace' }}>{r.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ThemeTokens;
