import { useState, useCallback, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import '@shikijs/twoslash/style-rich.css';
import './twoslash-dark.css';

interface CodeBlockProps {
  source: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export default function CodeBlock({
  source,
  expanded = false,
  onToggleExpand,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback(() => {
    if (!codeRef.current) return;
    // Clone the DOM tree and remove twoslash popup elements before extracting text
    const clone = codeRef.current.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll('.twoslash-popup-container, .twoslash-completion-list')
      .forEach((el) => el.remove());
    const text = clone.textContent ?? '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden shadow-sm text-xs bg-[#212121]">
      <div className="flex items-center justify-between gap-1.5 px-3 py-2 bg-[#2b2b2b] border-b border-[#383838] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
          <button
            onClick={onToggleExpand}
            className="w-2.5 h-2.5 rounded-full bg-green-400/80 hover:bg-green-300 transition-colors cursor-pointer"
            title={expanded ? 'Collapse code' : 'Expand code'}
            aria-label={expanded ? 'Collapse code' : 'Expand code'}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] text-indigo-300/60 hover:text-indigo-300 transition-colors cursor-pointer"
            title="Copy source code"
            aria-label="Copy source code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span className="font-mono">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="font-mono">Copy</span>
              </>
            )}
          </button>
          <span className="text-[10px] text-indigo-300/60 font-mono">TSX</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto" style={{ contain: 'strict' }}>
        <div
          ref={codeRef}
          key={source}
          className="h-full code-fade-in [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!text-[inherit] [&_pre]:!h-full [&_pre]:!bg-[#212121] [&_pre]:!pl-2"
          dangerouslySetInnerHTML={{ __html: source }}
        />
      </div>
    </div>
  );
}
