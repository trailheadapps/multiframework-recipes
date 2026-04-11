import Layout, { type RecipeItem } from '@/components/app/Layout';
import AccountCardSLDS from '@/recipes/styling/AccountCardSLDS';
import AccountCardDSR from '@/recipes/styling/AccountCardDSR';
import AccountCardShadcn from '@/recipes/styling/AccountCardShadcn';
import IconsSLDS from '@/recipes/styling/IconsSLDS';
import IconsDSR from '@/recipes/styling/IconsDSR';
import IconsLucide from '@/recipes/styling/IconsLucide';
import ButtonSLDS from '@/recipes/styling/ButtonSLDS';
import ButtonDSR from '@/recipes/styling/ButtonDSR';
import ButtonShadcn from '@/recipes/styling/ButtonShadcn';
import '@/styles/slds.css'; // Import at app.tsx for B2E apps

import accountCardSLDSSource from '@/recipes/styling/AccountCardSLDS.tsx?shiki';
import accountCardDSRSource from '@/recipes/styling/AccountCardDSR.tsx?shiki';
import accountCardShadcnSource from '@/recipes/styling/AccountCardShadcn.tsx?shiki';
import iconsSLDSSource from '@/recipes/styling/IconsSLDS.tsx?shiki';
import iconsDSRSource from '@/recipes/styling/IconsDSR.tsx?shiki';
import iconsLucideSource from '@/recipes/styling/IconsLucide.tsx?shiki';
import buttonSLDSSource from '@/recipes/styling/ButtonSLDS.tsx?shiki';
import buttonDSRSource from '@/recipes/styling/ButtonDSR.tsx?shiki';
import buttonShadcnSource from '@/recipes/styling/ButtonShadcn.tsx?shiki';

export default function Styling() {
  const recipes: RecipeItem[] = [
    {
      name: 'Account Card — SLDS Blueprint',
      description:
        'Account card built with SLDS blueprint classes (slds-card) — the JSX equivalent of <lightning-card>.',
      component: <AccountCardSLDS />,
      source: accountCardSLDSSource,
    },
    {
      name: 'Account Card — SLDS React',
      description:
        'Same Account data rendered with the Card component from design-system-react. DSR generates the correct SLDS markup automatically — the closest analogy to LWC\'s approach where a component abstracts the markup and you pass props.',
      component: <AccountCardDSR />,
      source: accountCardDSRSource,
    },
    {
      name: 'Account Card — shadcn/ui',
      description:
        "Account card built with shadcn/ui Card + Tailwind CSS. This is the approach used by the app shell itself. Best for custom UIs that don't need to match the Salesforce visual style. Contrast with the SLDS Blueprint and DSR variants.",
      component: <AccountCardShadcn />,
      source: accountCardShadcnSource,
    },
    {
      name: 'Icons — SLDS Blueprint',
      description:
        'SLDS icons via SVG sprite references — the slds-icon_container + <use href> pattern. Shows all three categories: utility (monochrome), standard (colorized square), and action (colorized circle). There is no <lightning-icon> React equivalent; you own this markup.',
      component: <IconsSLDS />,
      source: iconsSLDSSource,
    },
    {
      name: 'Icons — SLDS React',
      description:
        'SLDS icons rendered via the Icon component from @salesforce/design-system-react. Requires wrapping with IconSettings to configure the sprite path. DSR generates the slds-icon_container markup automatically.',
      component: <IconsDSR />,
      source: iconsDSRSource,
    },
    {
      name: 'Icons — Lucide',
      description:
        'Lucide icons as individual React components — no sprite infrastructure required. Stroke-based, tree-shakeable, and fully typed. Not a visual match for SLDS; best for custom UIs outside the Salesforce Experience Cloud style.',
      component: <IconsLucide />,
      source: iconsLucideSource,
    },
    {
      name: 'Button — SLDS Blueprint',
      description:
        'All standard SLDS button variants using slds-button classes on plain <button> elements. Shows variants (neutral, brand, outline-brand, destructive, success), disabled state, and icon buttons (icon-only and label+icon patterns).',
      component: <ButtonSLDS />,
      source: buttonSLDSSource,
    },
    {
      name: 'Button — SLDS React',
      description:
        'Same button variants via the Button component from @salesforce/design-system-react. DSR generates the slds-button markup automatically. Supports the same variants plus iconCategory/iconName/iconPosition for buttons with icons.',
      component: <ButtonDSR />,
      source: buttonDSRSource,
    },
    {
      name: 'Button — shadcn/ui',
      description:
        "shadcn/ui Button with all six variants (default, destructive, outline, secondary, ghost, link), three sizes, disabled state, and icon composition using Lucide icons. Uses the app shell's own Tailwind-based design system.",
      component: <ButtonShadcn />,
      source: buttonShadcnSource,
    },
  ];

  return <Layout header="Styling with SLDS" recipes={recipes} />;
}
