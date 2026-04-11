import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { recipeRegistry, type RecipeEntry } from '@/recipeRegistry';
import { cn } from '@/lib/utils';

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K (defined after open/close helpers)
  useEffect(() => {
    function onGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle is handled via open/closeSearch to avoid lint warnings
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onGlobalKey);
    return () => document.removeEventListener('keydown', onGlobalKey);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open) {
      // Small delay so the input is rendered before focusing
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  /** Open the search dropdown and reset state */
  function openSearch() {
    setQuery('');
    setSelectedIndex(0);
    setOpen(true);
  }

  /** Close the search dropdown */
  function closeSearch() {
    setOpen(false);
  }

  // Filter recipes
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return recipeRegistry.filter(
      (r) =>
        r.name.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower)
    );
  }, [query]);

  // Group results by category
  const grouped = useMemo(() => {
    const map = new Map<string, RecipeEntry[]>();
    for (const r of results) {
      const arr = map.get(r.category) ?? [];
      arr.push(r);
      map.set(r.category, arr);
    }
    return map;
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    const flat: RecipeEntry[] = [];
    for (const entries of grouped.values()) {
      flat.push(...entries);
    }
    return flat;
  }, [grouped]);

  /** Update query and reset keyboard selection to the first result */
  function updateQuery(value: string) {
    setQuery(value);
    setSelectedIndex(0);
  }

  const navigateToResult = useCallback(
    (entry: RecipeEntry) => {
      closeSearch();
      navigate(
        entry.recipeIndex > 0
          ? `${entry.categoryRoute}?recipe=${entry.recipeIndex}`
          : entry.categoryRoute
      );
    },
    [navigate]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      e.preventDefault();
      navigateToResult(flatResults[selectedIndex]);
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-selected="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.userAgent);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={openSearch}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search recipes...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          {isMac ? '\u2318' : 'Ctrl+'}K
        </kbd>
      </button>

      {/* Backdrop + dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={closeSearch}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-[420px] rounded-xl border border-border bg-background shadow-lg">
            {/* Search input */}
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search all recipes..."
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="max-h-80 overflow-y-auto p-2"
            >
              {query.trim() && flatResults.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No recipes found.
                </p>
              )}

              {!query.trim() && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Type to search across all recipes...
                </p>
              )}

              {Array.from(grouped.entries()).map(([category, entries]) => {
                return (
                  <div key={category} className="mb-1 last:mb-0">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      {category}
                    </div>
                    {entries.map((entry) => {
                      const flatIndex = flatResults.indexOf(entry);
                      const isSelected = flatIndex === selectedIndex;
                      return (
                        <button
                          key={`${entry.categoryRoute}-${entry.name}`}
                          data-selected={isSelected}
                          onClick={() => navigateToResult(entry)}
                          className={cn(
                            'w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors',
                            isSelected
                              ? 'bg-accent text-foreground'
                              : 'text-foreground/80 hover:bg-accent/50'
                          )}
                        >
                          <div className="font-medium">{entry.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {entry.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
