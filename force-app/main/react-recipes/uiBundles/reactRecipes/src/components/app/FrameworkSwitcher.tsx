import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  FRAMEWORKS,
  FRAMEWORK_LABEL,
  SOON_LABEL,
  isFrameworkEnabled,
  useFramework,
} from '@/lib/framework';
import { cn } from '@/lib/utils';

export default function FrameworkSwitcher() {
  const [framework, setFramework] = useFramework();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
      >
        {FRAMEWORK_LABEL[framework]}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-label="Choose framework"
          className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-md border border-border bg-background shadow-lg"
        >
          {FRAMEWORKS.map((f) => {
            const enabled = isFrameworkEnabled(f);
            const selected = f === framework;
            return (
              <button
                key={f}
                role="option"
                aria-selected={selected}
                aria-disabled={!enabled}
                disabled={!enabled}
                onClick={() => {
                  if (!enabled) return;
                  setFramework(f);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs',
                  enabled
                    ? 'text-foreground hover:bg-accent'
                    : 'text-muted-foreground/60 cursor-not-allowed'
                )}
                title={enabled ? undefined : `${FRAMEWORK_LABEL[f]} ${SOON_LABEL}`}
              >
                <span className="flex items-center gap-2">
                  {FRAMEWORK_LABEL[f]}
                  {!enabled && (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                      {SOON_LABEL}
                    </span>
                  )}
                </span>
                {selected && <Check className="h-3 w-3 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
