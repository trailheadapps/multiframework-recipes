import { ExternalLink } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/lib/links';

export default function Footer() {
  const repo = EXTERNAL_LINKS.serverRepo;
  return (
    <footer className="mt-12 border-t border-border/60 py-6">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-2 px-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          Multi-Framework Recipes — sample patterns for Salesforce-Hosted and
          Externally Hosted apps.
        </span>
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors"
          title={
            repo.placeholder
              ? `${repo.label} — coming soon`
              : repo.label
          }
        >
          {repo.label}
          {repo.placeholder ? ' (coming soon)' : ''}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </footer>
  );
}
