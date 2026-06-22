/**
 * Auto-Resize
 *
 * Demonstrates iframe height auto-adjustment. As content is added or removed
 * the lwc-shell on the host side receives resize events and updates the iframe
 * height automatically — no fixed height is set.
 *
 * Key concept: the bridge reports height changes via a ResizeObserver on
 * document.body. This happens automatically when using
 * @salesforce/experimental-mfe-bridge — no explicit setup needed in the app.
 * Simply add or remove content and the iframe height follows.
 *
 * @see ThemeTokens — receiving Salesforce design tokens
 */
import { useEffect, useState } from 'react';
import bridge from '@salesforce/experimental-mfe-bridge';

interface Item {
    id: number;
    text: string;
}

let nextId = 1;

function makeItem(): Item {
    return { id: nextId++, text: `Item ${nextId - 1} — added at ${new Date().toLocaleTimeString()}` };
}

export default function AutoResize() {
    const [items, setItems] = useState<Item[]>([makeItem(), makeItem()]);
    const [connected, setConnected] = useState(bridge.isConnected());

    useEffect(() => {
        // 'connected' fires once after the host's salesforce-shell-ready
        // arrives — auto-resize only takes effect once the bridge is connected.
        const sync = () => setConnected(bridge.isConnected());
        sync();
        bridge.addEventListener('connected', sync);
        return () => bridge.removeEventListener('connected', sync);
    }, []);

    function addItem() {
        setItems(prev => [...prev, makeItem()]);
    }

    function removeItem(id: number) {
        setItems(prev => prev.filter(item => item.id !== id));
    }

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">
                Auto-Resize
                <span
                    className={`status-dot ${connected ? 'dot-green' : 'dot-gray'}`}
                    title={connected ? 'Connected to Salesforce host' : 'Running standalone'}
                    style={{ marginLeft: 8 }}
                />
            </h2>
            <p className="recipe-description">
                Add or remove items — the Salesforce iframe height adjusts automatically.
                No fixed height is set on the host. The bridge reports content height via
                a ResizeObserver.
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
