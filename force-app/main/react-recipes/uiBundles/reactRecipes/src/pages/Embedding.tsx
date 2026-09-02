import { Link } from 'react-router';
import { AppWindow, ArrowRight, ExternalLink, Info } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

// GitHub source for the guest recipes. The host LWCs live in the
// microfrontend-recipes package; those links are stable too, but this
// page lists the guests, so it points at the guest .tsx sources.
const GUEST_SOURCE_BASE =
  'https://github.com/trailheadapps/multiframework-recipes/blob/main/force-app/main/react-recipes/uiBundles/reactRecipes/src/recipes/embedding';

interface EmbeddingRecipe {
  name: string;
  route: string;
  source: string;
  description: string;
}

const recipes: EmbeddingRecipe[] = [
  {
    name: 'Basic Render',
    route: '/embedding/basic-render',
    source: `${GUEST_SOURCE_BASE}/BasicRender.tsx`,
    description:
      'The minimum viable guest. Reads Account fields the host pushes over the SDK ui-state channel and renders them as a card.',
  },
  {
    name: 'Send to Host',
    route: '/embedding/send-to-host',
    source: `${GUEST_SOURCE_BASE}/SendToHost.tsx`,
    description:
      'A scoring matrix; clicking a cell dispatches a score event the host writes back to the record.',
  },
  {
    name: 'Read Host Data',
    route: '/embedding/read-host-data',
    source: `${GUEST_SOURCE_BASE}/ReadHostData.tsx`,
    description:
      'Subscribes to live host updates — each change the host pushes re-renders the guest.',
  },
  {
    name: 'Unsaved Changes',
    route: '/embedding/unsaved-changes',
    source: `${GUEST_SOURCE_BASE}/UnsavedChanges.tsx`,
    description:
      'An editable form that marks dirty state, so the record page shows a Save/Discard bar and warns before navigating away.',
  },
  {
    name: 'Theme Tokens',
    route: '/embedding/theme-tokens',
    source: `${GUEST_SOURCE_BASE}/ThemeTokens.tsx`,
    description:
      'The host sends a theme name; the guest maps it to CSS variables its components read.',
  },
  {
    name: 'Auto Resize',
    route: '/embedding/auto-resize',
    source: `${GUEST_SOURCE_BASE}/AutoResize.tsx`,
    description:
      "Add or remove items and the embedded iframe's height follows the guest's content automatically.",
  },
  {
    name: 'Receive Event',
    route: '/embedding/receive-event',
    source: `${GUEST_SOURCE_BASE}/ReceiveEvent.tsx`,
    description:
      'The host pushes an event down to the guest (a live stock quote) — the mirror of Send to Host.',
  },
];

export default function Embedding() {
  return (
    <div className="py-10">
      {/* Hero */}
      <div className="mb-12 grid items-start gap-10 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <AppWindow className="text-primary h-10 w-10" />
            <h1 className="text-foreground text-4xl font-bold tracking-tight">
              UI Embedding
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md text-xl">
            Embed React components in Lightning
          </p>
        </div>
      </div>

      {/* Framing note */}
      <div className="border-border/70 bg-muted/40 mb-8 flex w-fit max-w-full gap-3 rounded-xl border p-4">
        <Info className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-muted-foreground text-sm leading-relaxed">
          These are microfrontend <strong>guests</strong> examples. To see them
          running live, open the <strong>Microfrontend Recipes</strong> app from
          the App Launcher.
        </p>
      </div>

      {/* Guest recipes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map(recipe => (
          <Card key={recipe.route} className="border-border/70 flex flex-col">
            <CardHeader>
              <CardTitle className="text-primary text-base">
                {recipe.name}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {recipe.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex items-center gap-4 text-sm">
              <Link
                to={recipe.route}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
              >
                Open guest
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
              <a
                href={recipe.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                Source
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
