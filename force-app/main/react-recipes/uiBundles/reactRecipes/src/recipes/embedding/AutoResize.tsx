/**
 * Auto-Resize
 *
 * Add or remove items; the iframe height follows the guest's content
 * automatically. The SDK watches `document.body` and reports height
 * changes to the host, which resizes the iframe. No SDK call is needed.
 *
 * `viewSDK.resize(width, height)` is available if you need to set the
 * size explicitly. It accepts pixel strings like "800" or "800px".
 *
 * @see ThemeTokens — receiving Salesforce design tokens
 */
import { useRef, useState } from 'react';
import { ExternalLink, Plus, X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Item {
  id: number;
  text: string;
}

export default function AutoResize() {
  const nextIdRef = useRef(3);
  const [items, setItems] = useState<Item[]>(() => [
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
  ]);

  function makeItem(): Item {
    const id = nextIdRef.current++;
    return {
      id,
      text: `Item ${id} — added at ${new Date().toLocaleTimeString()}`,
    };
  }

  function addItem() {
    const item = makeItem();
    setItems(prev => [...prev, item]);
  }

  function removeItem(id: number) {
    setItems(prev => prev.filter(item => item.id !== id));
  }

  return (
    <div className="p-1">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </CardTitle>
          <CardDescription>
            The iframe height follows this list — add or remove to see it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button size="sm" onClick={addItem}>
              <Plus className="size-3.5" aria-hidden />
              Add item
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setItems([])}
              disabled={items.length === 0}
            >
              Clear all
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No items — iframe should be at minimum height.
            </p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {items.map(item => (
                <li
                  key={item.id}
                  className="ring-border flex items-center justify-between gap-2 rounded-md px-3 py-1.5 ring-1"
                >
                  <span>{item.text}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Remove item"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <a
        href="https://github.com/trailheadapps/multiframework-recipes/blob/main/force-app/main/react-recipes/uiBundles/reactRecipes/src/recipes/embedding/AutoResize.tsx"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary mt-3 inline-flex items-center gap-1 text-xs"
      >
        Guest (AutoResize.tsx)
        <ExternalLink className="size-3" aria-hidden />
      </a>
    </div>
  );
}
