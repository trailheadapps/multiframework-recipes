/**
 * Auto-Resize
 *
 * Demonstrates calling viewSDK.resize() to ask the host to resize the
 * embedding container. A ResizeObserver tracks document.body's height and
 * forwards the new size to the host on every change.
 *
 * Key concept: viewSDK.resize(width, height) accepts pixel-only strings —
 * "800", "800px", or "" to leave that axis untouched. Non-pixel values like
 * "auto" or "100%" throw. Unlike the legacy bridge — which auto-pushed body
 * height — the SDK is explicit: you decide when (and what dimensions) to
 * send.
 *
 * @see ThemeTokens — receiving Salesforce design tokens
 */
import { useEffect, useRef, useState } from 'react';
import { useSdk } from '../sdk-context';

interface Item {
    id: number;
    text: string;
}

let nextId = 1;

function makeItem(): Item {
    return { id: nextId++, text: `Item ${nextId - 1} — added at ${new Date().toLocaleTimeString()}` };
}

export default function AutoResize() {
    const { view } = useSdk();
    const [items, setItems] = useState<Item[]>([makeItem(), makeItem()]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(entries => {
            const height = entries[0]?.contentRect.height;
            if (height == null) return;
            // Empty string on width means "leave the host's width untouched";
            // only height flows. `resize` on the MFE surface accepts pixel-only
            // values, so "auto"/"100%" would throw.
            void view.resize?.('', `${Math.ceil(height)}px`);
        });
        observer.observe(document.body);
        return () => observer.disconnect();
    }, [view]);

    function addItem() {
        setItems(prev => [...prev, makeItem()]);
    }

    function removeItem(id: number) {
        setItems(prev => prev.filter(item => item.id !== id));
    }

    return (
        <div className="recipe-container" ref={containerRef}>
            <h2 className="recipe-title">Auto-Resize</h2>
            <p className="recipe-description">
                Add or remove items — a ResizeObserver tracks body height and calls{' '}
                <code>viewSDK.resize()</code> so the host iframe matches the content.
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button className="recipe-btn recipe-btn-primary" onClick={addItem}>
                    + Add item
                </button>
                <button
                    className="recipe-btn recipe-btn-secondary"
                    onClick={() => setItems([])}
                    disabled={items.length === 0}
                >
                    Clear all
                </button>
            </div>

            <div className="recipe-card">
                <p className="recipe-label">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                {items.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: 13 }}>No items — iframe should be at minimum height.</p>
                ) : (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {items.map(item => (
                            <li
                                key={item.id}
                                style={{ fontSize: 13, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <span>{item.text}</span>
                                <button
                                    className="recipe-btn recipe-btn-secondary"
                                    style={{ padding: '2px 8px', fontSize: 11 }}
                                    onClick={() => removeItem(item.id)}
                                >
                                    remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
