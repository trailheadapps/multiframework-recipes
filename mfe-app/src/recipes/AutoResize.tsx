/**
 * Auto-Resize
 *
 * Add or remove items — the iframe grows/shrinks automatically to match its
 * content. No SDK call is needed for the common case: `bootstrapSession`
 * attaches an `EmbeddingResizer` on `document.body` that RAF-coalesces height
 * changes and sends `ui/notifications/resize` for each one. The host
 * `<lightning-embedding>` applies the height.
 *
 * `viewSDK.resize(width, height)` is available for surfaces that need width
 * control or want to override the bootstrap observer. It accepts pixel-only
 * strings ("800", "800px", ""); non-pixel values like "auto" or "100%" throw.
 *
 * @see ThemeTokens — receiving Salesforce design tokens
 */
import { useState } from 'react';

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

    function addItem() {
        setItems(prev => [...prev, makeItem()]);
    }

    function removeItem(id: number) {
        setItems(prev => prev.filter(item => item.id !== id));
    }

    return (
        <div className="recipe-container">
            <h2 className="recipe-title">Auto-Resize</h2>
            <p className="recipe-description">
                Add or remove items — the bridge's bootstrap-attached resizer observes
                <code> document.body</code> and sends <code>ui/notifications/resize</code> to
                the host on every height change.
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
