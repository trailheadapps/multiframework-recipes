import { useNavigate } from 'react-router';
import { ArrowRight, Code2, Lightbulb } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRecipeCount } from '@/recipeRegistry';

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
      'Style components using SLDS blueprint classes, shadcn/ui with Tailwind CSS, and Lucide icons.',
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
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="py-10">
      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Code2 className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            React Recipes
          </h1>
        </div>
        <p className="text-xl text-muted-foreground mb-6 max-w-xl">
          Sample patterns for building React web apps on Salesforce
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/hello')}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
          <a
            href="https://developer.salesforce.com/docs/platform/multiframework/guide"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            View Developer Guide
          </a>
        </div>

        {/* Aside pointing to the microfrontend guests. Placed in the hero (with
            a clear gap from the CTA above) so it's seen without scrolling, but
            kept as an obvious muted tip so it doesn't compete with Get Started.
            The persistent nav link reinforces it; the full story lives on the
            page it links to. */}
        <div className="border-border/70 bg-muted/40 mt-8 flex w-fit max-w-full items-center gap-3 rounded-xl border px-4 py-3">
          <Lightbulb className="text-primary size-5 shrink-0" aria-hidden />
          <p className="text-muted-foreground text-sm">
            This app also serves guest views for embedding in Salesforce.{' '}
            <button
              onClick={() => navigate('/embedding')}
              className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
            >
              Browse the guest recipes
              <ArrowRight className="size-3.5" aria-hidden />
            </button>
          </p>
        </div>
      </div>

      {/* Category tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(cat => (
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
                <CardDescription className="text-sm leading-relaxed">
                  {cat.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
