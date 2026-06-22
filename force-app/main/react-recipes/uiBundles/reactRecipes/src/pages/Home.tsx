import { useNavigate } from 'react-router';
import { Code2, ExternalLink, Package, Globe } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getCategoryFramework,
  getCategoryHosting,
  getRecipeCount,
} from '@/recipeRegistry';
import {
  FRAMEWORK_LABEL,
  HOSTING_LABEL,
  useFramework,
  useHostingFilter,
  type HostingFilter,
} from '@/lib/framework';
import { EXTERNAL_LINKS } from '@/lib/links';
import RecipeFlavorChips from '@/components/app/RecipeFlavorChips';
import { cn } from '@/lib/utils';

const categories = [
  {
    to: '/hello',
    name: 'Hello',
    description:
      'Start here. Covers JSX binding, conditional rendering, list rendering, lifecycle, and component composition with props and callbacks.',
  },
  {
    to: '/read-data',
    name: 'Read Data',
    description:
      'Fetch Salesforce records via GraphQL. Covers single records, lists, filtering, sorting, pagination, related records, and aliased multi-object queries.',
  },
  {
    to: '/modify-data',
    name: 'Modify Data',
    description:
      'Create, update, and delete Salesforce records via GraphQL mutations. Covers server error handling and combined query + mutation patterns.',
  },
  {
    to: '/salesforce-apis',
    name: 'Salesforce APIs',
    description:
      'Call platform APIs beyond GraphQL — Apex REST endpoints and Connect API resources — directly from a React web app.',
  },
  {
    to: '/error-handling',
    name: 'Error Handling',
    description:
      'Handle loading, empty, and error states gracefully. Covers React Error Boundaries, GraphQL error responses, and loading/empty/error UI patterns.',
  },
  {
    to: '/styling',
    name: 'Styling',
    description:
      'Style components using SLDS utility classes, SLDS React (Design System React) components, and shadcn/ui with Tailwind CSS.',
  },
  {
    to: '/routing',
    name: 'Routing',
    description:
      'Navigate between views with React Router. Covers Link, NavLink, route parameters, and nested routes in a Salesforce web app context.',
  },
  {
    to: '/integration',
    name: 'Integration',
    description:
      'End-to-end patterns that combine multiple Salesforce APIs and React features into realistic, production-style application pages.',
  },
  {
    to: '/embedding',
    name: 'Embedding',
    description:
      'Embed an external framework app into Salesforce Lightning via lwc-shell. Covers the postMessage bridge: basic embed, receiving host data, dispatching events, auto-resize, theme tokens, and dirty state.',
  },
];

const HOSTING_FILTER_OPTIONS: { value: HostingFilter; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'salesforce-hosted', label: HOSTING_LABEL['salesforce-hosted'] },
  { value: 'externally-hosted', label: HOSTING_LABEL['externally-hosted'] },
];

export default function Home() {
  const navigate = useNavigate();
  const [framework] = useFramework();
  const [filter, setFilter] = useHostingFilter();

  const visibleCategories = categories.filter((cat) => {
    if (!filter) return true;
    return getCategoryHosting(cat.to) === filter;
  });

  function activate(value: HostingFilter) {
    setFilter(value);
  }

  function onFilterKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const len = HOSTING_FILTER_OPTIONS.length;
    const nextIndex =
      e.key === 'ArrowRight' ? (index + 1) % len : (index - 1 + len) % len;
    activate(HOSTING_FILTER_OPTIONS[nextIndex].value);
    const radios =
      e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="radio"]'
      );
    radios?.[nextIndex]?.focus();
  }

  return (
    <div className="py-10">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Code2 className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Multi-Framework Recipes — {FRAMEWORK_LABEL[framework]}
          </h1>
        </div>
        <p className="text-xl text-muted-foreground mb-6 max-w-xl">
          Sample patterns for Salesforce-Hosted and Externally Hosted apps.
          React today; Vue and Angular planned.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/hello')}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
          <a
            href={EXTERNAL_LINKS.developerGuide.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            View Developer Guide
          </a>
        </div>
      </div>

      {/* Hosting filter */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-foreground">Hosting:</span>
        <div role="radiogroup" aria-label="Filter by hosting" className="inline-flex rounded-lg border border-border bg-card p-0.5">
          {HOSTING_FILTER_OPTIONS.map((option, i) => {
            const active = filter === option.value;
            return (
              <button
                key={option.label}
                role="radio"
                aria-checked={active}
                onClick={() => activate(option.value)}
                onKeyDown={(e) => onFilterKeyDown(e, i)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCategories.map((cat) => {
          const hosting = getCategoryHosting(cat.to);
          const fw = getCategoryFramework(cat.to);
          const flavors =
            hosting && fw ? [{ hosting, framework: fw }] : [];
          return (
            <button
              key={cat.to}
              onClick={() => navigate(cat.to)}
              className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <Card className="h-full border-border/70 shadow-none hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base text-primary">
                      {cat.name}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {getRecipeCount(cat.to)} recipes
                    </Badge>
                  </div>
                  {flavors.length > 0 && (
                    <RecipeFlavorChips flavors={flavors} className="pt-1" />
                  )}
                  <CardDescription className="text-sm leading-relaxed">
                    {cat.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </button>
          );
        })}
        {visibleCategories.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">
            No categories match this hosting filter yet.
          </p>
        )}
      </div>

      {/* Hosting Models block */}
      <section className="mt-14 border-t border-border/60 pt-10">
        <h2 className="text-lg font-semibold tracking-tight">Hosting Models</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Two ways to ship a framework app on Salesforce. Pick the one that
          matches where your app lives.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <HostingModelCard
            icon={<Package className="h-5 w-5 text-primary" />}
            title={HOSTING_LABEL['salesforce-hosted']}
            blurb={
              'Deploy your app to *.salesforce.app via UI bundles. Best for new apps that want a single deploy step and built-in auth.'
            }
            onClick={() => activate('salesforce-hosted')}
          />
          <HostingModelCard
            icon={<Globe className="h-5 w-5 text-primary" />}
            title={HOSTING_LABEL['externally-hosted']}
            blurb={
              'Host on AWS, Heroku, or your own infra; embed via lwc-shell. Best for existing apps and SaaS vendors.'
            }
            onClick={() => activate('externally-hosted')}
          />
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          Want to run your own server locally with SSL?{' '}
          <a
            href={EXTERNAL_LINKS.serverRepo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-foreground underline-offset-2 hover:underline"
          >
            {EXTERNAL_LINKS.serverRepo.label}
            {EXTERNAL_LINKS.serverRepo.placeholder ? ' (coming soon)' : ''}
            <ExternalLink className="h-3 w-3" />
          </a>
          .
        </p>
      </section>
    </div>
  );
}

interface HostingModelCardProps {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  onClick: () => void;
}

function HostingModelCard({ icon, title, blurb, onClick }: HostingModelCardProps) {
  return (
    <button
      onClick={onClick}
      className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="h-full border-border/70 shadow-none hover:border-primary/50 transition-all">
        <CardHeader>
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <CardDescription className="text-sm leading-relaxed">
            {blurb}
          </CardDescription>
        </CardHeader>
      </Card>
    </button>
  );
}

