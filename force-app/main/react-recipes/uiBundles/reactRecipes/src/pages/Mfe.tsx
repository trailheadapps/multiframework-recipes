/**
 * Embedding recipes page.
 *
 * Each recipe has one or more flavors (hosting × framework). The MFE-style
 * recipes here ship Externally-Hosted React only today; SF-Hosted and
 * Vue/Angular flavors are wired as disabled "(soon)" tabs so users can see
 * the IA without us hiding the future surface.
 *
 * Source files: Guest (in mfe-app/), LWC host JS, LWC host HTML — all imported
 * via ?shiki so the code shown is always current.
 */
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ExternalLink, Info } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import CodeBlock from '@/components/app/CodeBlock';
import { EXTERNAL_LINKS } from '@/lib/links';
import {
  FRAMEWORKS,
  FRAMEWORK_LABEL,
  HOSTING_LABEL,
  HOSTING_PARAM_TO_VALUE,
  HOSTING_VALUE_TO_PARAM,
  SOON_LABEL,
  isFramework,
  isFrameworkEnabled,
} from '@/lib/framework';
import type { Framework, Hosting } from '@/recipeRegistry';

// MFE bridge sources (mfe-app/src/recipes/)
import basicEmbedMfe from '../../../../../../../mfe-app/src/recipes/BasicEmbed.tsx?shiki';
import receiveDataMfe from '../../../../../../../mfe-app/src/recipes/ReceiveData.tsx?shiki';
import sendEventMfe from '../../../../../../../mfe-app/src/recipes/SendEvent.tsx?shiki';
import autoResizeMfe from '../../../../../../../mfe-app/src/recipes/AutoResize.tsx?shiki';
import themeTokensMfe from '../../../../../../../mfe-app/src/recipes/ThemeTokens.tsx?shiki';
import dirtyStateMfe from '../../../../../../../mfe-app/src/recipes/DirtyState.tsx?shiki';
import graphQLMfe from '../../../../../../../mfe-app/src/recipes/GraphQLBridge.tsx?shiki';

// LWC host JS sources (force-app/main/default/lwc/)
import basicEmbedJs from '../../../../../default/lwc/mfeBasicEmbed/mfeBasicEmbed.js?shiki=js';
import receiveDataJs from '../../../../../default/lwc/mfeReceiveData/mfeReceiveData.js?shiki=js';
import sendEventJs from '../../../../../default/lwc/mfeSendEvent/mfeSendEvent.js?shiki=js';
import autoResizeJs from '../../../../../default/lwc/mfeAutoResize/mfeAutoResize.js?shiki=js';
import themeTokensJs from '../../../../../default/lwc/mfeThemeTokens/mfeThemeTokens.js?shiki=js';
import dirtyStateJs from '../../../../../default/lwc/mfeDirtyState/mfeDirtyState.js?shiki=js';
import graphQLJs from '../../../../../default/lwc/mfeGraphQL/mfeGraphQL.js?shiki=js';

// LWC host HTML sources (force-app/main/default/lwc/)
import basicEmbedHtml from '../../../../../default/lwc/mfeBasicEmbed/mfeBasicEmbed.html?shiki=html';
import receiveDataHtml from '../../../../../default/lwc/mfeReceiveData/mfeReceiveData.html?shiki=html';
import sendEventHtml from '../../../../../default/lwc/mfeSendEvent/mfeSendEvent.html?shiki=html';
import autoResizeHtml from '../../../../../default/lwc/mfeAutoResize/mfeAutoResize.html?shiki=html';
import themeTokensHtml from '../../../../../default/lwc/mfeThemeTokens/mfeThemeTokens.html?shiki=html';
import dirtyStateHtml from '../../../../../default/lwc/mfeDirtyState/mfeDirtyState.html?shiki=html';
import graphQLHtml from '../../../../../default/lwc/mfeGraphQL/mfeGraphQL.html?shiki=html';

interface FlavorSources {
  mfeSource: string;
  lwcJsSource: string;
  lwcHtmlSource: string;
}

interface MfeRecipeFlavor extends FlavorSources {
  hosting: Hosting;
  framework: Framework;
}

interface MfeRecipe {
  name: string;
  description: string;
  flavors: MfeRecipeFlavor[];
}

const recipes: MfeRecipe[] = [
  {
    name: 'Basic Embed',
    description:
      'Minimum viable lwc-shell embed. The host creates the shell, sets src and sandbox, and listens for widget-ready. The MFE uses bridge.isConnected() to detect the embedding context.',
    flavors: [
      {
        hosting: 'externally-hosted',
        framework: 'react',
        mfeSource: basicEmbedMfe,
        lwcJsSource: basicEmbedJs,
        lwcHtmlSource: basicEmbedHtml,
      },
    ],
  },
  {
    name: 'Receive Data',
    description:
      "Host pushes data into the MFE via shell.updateData(). The MFE receives it with bridge.addEventListener('data', handler).",
    flavors: [
      {
        hosting: 'externally-hosted',
        framework: 'react',
        mfeSource: receiveDataMfe,
        lwcJsSource: receiveDataJs,
        lwcHtmlSource: receiveDataHtml,
      },
    ],
  },
  {
    name: 'Send Event',
    description:
      'MFE dispatches custom events to the host via bridge.dispatchEvent(). The host catches them as DOM events on the shell element.',
    flavors: [
      {
        hosting: 'externally-hosted',
        framework: 'react',
        mfeSource: sendEventMfe,
        lwcJsSource: sendEventJs,
        lwcHtmlSource: sendEventHtml,
      },
    ],
  },
  {
    name: 'Auto-Resize',
    description:
      'Iframe height follows MFE content via a ResizeObserver inside the iframe. No fixed height on the shell. Cancel the resize event to opt out.',
    flavors: [
      {
        hosting: 'externally-hosted',
        framework: 'react',
        mfeSource: autoResizeMfe,
        lwcJsSource: autoResizeJs,
        lwcHtmlSource: autoResizeHtml,
      },
    ],
  },
  {
    name: 'Theme Tokens',
    description:
      'Salesforce CSS custom properties are sent to the MFE on connect. The MFE applies them to document.documentElement. Call shell.refreshTheme() to re-sync.',
    flavors: [
      {
        hosting: 'externally-hosted',
        framework: 'react',
        mfeSource: themeTokensMfe,
        lwcJsSource: themeTokensJs,
        lwcHtmlSource: themeTokensHtml,
      },
    ],
  },
  {
    name: 'Dirty State',
    description:
      'MFE notifies the host of unsaved changes via trackdirtystate events. The host can show a warning and block navigation.',
    flavors: [
      {
        hosting: 'externally-hosted',
        framework: 'react',
        mfeSource: dirtyStateMfe,
        lwcJsSource: dirtyStateJs,
        lwcHtmlSource: dirtyStateHtml,
      },
    ],
  },
  {
    name: 'GraphQL Bridge',
    description:
      'MFE executes Salesforce GraphQL via bridge.graphql(). The host proxies requests — no allow-same-origin needed. Up to 10 concurrent requests with automatic queuing.',
    flavors: [
      {
        hosting: 'externally-hosted',
        framework: 'react',
        mfeSource: graphQLMfe,
        lwcJsSource: graphQLJs,
        lwcHtmlSource: graphQLHtml,
      },
    ],
  },
];

const HOSTINGS: Hosting[] = ['externally-hosted', 'salesforce-hosted'];

function findFlavor(
  recipe: MfeRecipe,
  hosting?: Hosting,
  framework?: Framework
): MfeRecipeFlavor {
  if (hosting && framework) {
    const exact = recipe.flavors.find(
      (f) => f.hosting === hosting && f.framework === framework
    );
    if (exact) return exact;
  }
  if (hosting) {
    const byHosting = recipe.flavors.find((f) => f.hosting === hosting);
    if (byHosting) return byHosting;
  }
  if (framework) {
    const byFramework = recipe.flavors.find((f) => f.framework === framework);
    if (byFramework) return byFramework;
  }
  return recipe.flavors[0];
}

export default function Mfe() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = recipes[selectedIndex];
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse URL flavor params (host, fw) and resolve via fallback. The URL is
  // corrected via replaceState so an unknown combination doesn't pollute back.
  const hostParam = searchParams.get('host');
  const fwParam = searchParams.get('fw');
  const requestedHosting = hostParam ? HOSTING_PARAM_TO_VALUE[hostParam] : undefined;
  const requestedFramework =
    fwParam && isFramework(fwParam) ? fwParam : undefined;
  const flavor = findFlavor(selected, requestedHosting, requestedFramework);

  function selectFlavor(hosting: Hosting, framework: Framework) {
    const next = new URLSearchParams(searchParams);
    next.set('host', HOSTING_VALUE_TO_PARAM[hosting]);
    next.set('fw', framework);
    if (searchParams.get('recipe')) {
      next.set('recipe', searchParams.get('recipe')!);
    }
    setSearchParams(next, { replace: true });
  }

  const isExternallyHosted = flavor.hosting === 'externally-hosted';

  return (
    <div className="py-4">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Embedding</h1>
          <span className="rounded-full border border-primary/60 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {HOSTING_LABEL[flavor.hosting]} · {FRAMEWORK_LABEL[flavor.framework]}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          An external framework app embedded into Salesforce via{' '}
          <code className="text-xs">lwc-shell</code>. The Platform SDK (bridge)
          is the shared contract; a Salesforce-Hosted flavor is planned.
        </p>
        <div className="mt-1.5 h-0.5 w-12 rounded-full bg-primary" />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,4fr)] gap-5">
        {/* Sidebar */}
        <nav
          className="sticky top-20 h-[calc(100vh-12rem)] overflow-y-auto rounded-lg border border-primary/70 bg-card p-2"
          aria-label="MFE recipes"
        >
          <ul className="space-y-0.5">
            {recipes.map((recipe, i) => (
              <li key={recipe.name}>
                <button
                  onClick={() => setSelectedIndex(i)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                    i === selectedIndex
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {recipe.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Recipe card */}
        <Card className="border-primary/70 shadow-none">
          <CardHeader>
            <CardTitle>{selected.name}</CardTitle>
            <CardDescription>{selected.description}</CardDescription>

            {/* Flavor switcher: Hosting */}
            <FlavorRow
              label="Hosting:"
              role="tablist"
              ariaLabel="Hosting"
            >
              {HOSTINGS.map((h) => {
                const enabled = recipe_hasFlavor(selected, h, flavor.framework);
                const active = flavor.hosting === h;
                return (
                  <FlavorButton
                    key={h}
                    active={active}
                    enabled={enabled}
                    onClick={() => selectFlavor(h, flavor.framework)}
                    title={
                      enabled
                        ? undefined
                        : `${HOSTING_LABEL[h]} flavor ${SOON_LABEL}`
                    }
                  >
                    {HOSTING_LABEL[h]}
                    {!enabled && <SoonTag />}
                  </FlavorButton>
                );
              })}
            </FlavorRow>

            {/* Flavor switcher: Framework */}
            <FlavorRow
              label="Framework:"
              role="tablist"
              ariaLabel="Framework"
            >
              {FRAMEWORKS.map((f) => {
                const frameworkAvailable = isFrameworkEnabled(f);
                const flavorAvailable =
                  frameworkAvailable && recipe_hasFlavor(selected, flavor.hosting, f);
                const active = flavor.framework === f;
                return (
                  <FlavorButton
                    key={f}
                    active={active}
                    enabled={flavorAvailable}
                    onClick={() => selectFlavor(flavor.hosting, f)}
                    title={
                      flavorAvailable
                        ? undefined
                        : `${FRAMEWORK_LABEL[f]} flavor ${SOON_LABEL}`
                    }
                  >
                    {FRAMEWORK_LABEL[f]}
                    {!flavorAvailable && <SoonTag />}
                  </FlavorButton>
                );
              })}
            </FlavorRow>

            {isExternallyHosted && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Externally hosted: this recipe assumes the guest app runs on a
                  third-party domain. For local dev with SSL, see{' '}
                  <a
                    href={EXTERNAL_LINKS.serverRepo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-foreground underline-offset-2 hover:underline"
                  >
                    {EXTERNAL_LINKS.serverRepo.label}
                    {EXTERNAL_LINKS.serverRepo.placeholder
                      ? ' (coming soon)'
                      : ''}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  .
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="mfe" key={selected.name}>
              <TabsList>
                <TabsTrigger value="mfe">
                  Guest ({FRAMEWORK_LABEL[flavor.framework]})
                </TabsTrigger>
                <TabsTrigger value="lwc-js">Host (LWC JS)</TabsTrigger>
                <TabsTrigger value="lwc-html">Host (LWC HTML)</TabsTrigger>
              </TabsList>
              <TabsContent value="mfe">
                <div className="h-[calc(100vh-24rem)] min-h-[400px]">
                  <CodeBlock source={flavor.mfeSource} />
                </div>
              </TabsContent>
              <TabsContent value="lwc-js">
                <div className="h-[calc(100vh-24rem)] min-h-[400px]">
                  <CodeBlock source={flavor.lwcJsSource} />
                </div>
              </TabsContent>
              <TabsContent value="lwc-html">
                <div className="h-[calc(100vh-24rem)] min-h-[400px]">
                  <CodeBlock source={flavor.lwcHtmlSource} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function recipe_hasFlavor(
  recipe: MfeRecipe,
  hosting: Hosting,
  framework: Framework
): boolean {
  return recipe.flavors.some(
    (f) => f.hosting === hosting && f.framework === framework
  );
}

interface FlavorRowProps {
  label: string;
  role: 'tablist' | 'radiogroup';
  ariaLabel: string;
  children: React.ReactNode;
}

function FlavorRow({ label, role, ariaLabel, children }: FlavorRowProps) {
  return (
    <div className="mt-3 flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <div role={role} aria-label={ariaLabel} className="flex flex-wrap gap-1">
        {children}
      </div>
    </div>
  );
}

interface FlavorButtonProps {
  active: boolean;
  enabled: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}

function FlavorButton({
  active,
  enabled,
  onClick,
  title,
  children,
}: FlavorButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-disabled={!enabled}
      disabled={!enabled}
      onClick={enabled ? onClick : undefined}
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : enabled
          ? 'border-border bg-background text-foreground hover:bg-accent'
          : 'border-border/50 bg-muted/30 text-muted-foreground/60 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

function SoonTag() {
  return (
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
      {SOON_LABEL}
    </span>
  );
}
