// Mirrors the LWC lightning-skeleton-text and lightning-skeleton-avatar API.
// Usage:
//   <Skeleton lines={3} />          — stacked text lines (like lightning-skeleton-text)
//   <Skeleton variant="avatar" />   — circle avatar (like lightning-skeleton-avatar)

const LINE_WIDTHS = ['100%', '75%', '50%', '90%', '65%', '80%', '45%'];

interface SkeletonProps {
  variant?: 'text' | 'avatar';
  lines?: number;
}

export default function Skeleton({ variant = 'text', lines = 1 }: SkeletonProps) {
  if (variant === 'avatar') {
    return <span className="animate-pulse bg-muted rounded" style={{ width: '3rem', height: '3rem', borderRadius: '50%', flexShrink: 0 }} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="animate-pulse bg-muted rounded" style={{ width: LINE_WIDTHS[i % LINE_WIDTHS.length], height: '0.875rem' }} />
      ))}
    </div>
  );
}
