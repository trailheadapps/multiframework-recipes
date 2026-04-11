import { useNavigate } from 'react-router';
import { Code2 } from 'lucide-react';
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
            href="https://developer.salesforce.com/docs/platform/einstein-for-devs/guide/reactdev-overview.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            View Developer Guide
          </a>
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
