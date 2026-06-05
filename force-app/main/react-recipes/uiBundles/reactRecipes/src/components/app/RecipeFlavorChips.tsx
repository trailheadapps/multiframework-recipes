import type { RecipeFlavor } from '@/recipeRegistry';
import { FRAMEWORK_LABEL, HOSTING_SHORT_LABEL } from '@/lib/framework';
import { cn } from '@/lib/utils';

interface Props {
  flavors: RecipeFlavor[];
  size?: 'sm' | 'md';
  className?: string;
}

/** Hosting + Framework chips for a recipe. Color does not carry meaning;
 * each chip always includes a text label. */
export default function RecipeFlavorChips({
  flavors,
  size = 'sm',
  className,
}: Props) {
  if (flavors.length === 0) return null;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {flavors.map((f) => (
        <span
          key={`${f.hosting}-${f.framework}`}
          className={cn(
            'inline-flex items-center rounded-full border font-medium',
            padding,
            f.hosting === 'salesforce-hosted'
              ? 'border-primary/60 bg-primary/10 text-primary'
              : 'border-border bg-muted text-muted-foreground'
          )}
        >
          {HOSTING_SHORT_LABEL[f.hosting]} · {FRAMEWORK_LABEL[f.framework]}
        </span>
      ))}
    </div>
  );
}
