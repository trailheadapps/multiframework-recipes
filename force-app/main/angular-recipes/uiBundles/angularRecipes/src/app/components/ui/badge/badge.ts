import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';

// Mirrors the app's other spartan-ng wrappers, but hand-built: spartan ships no
// hlm-badge primitive, so the variants live here as Tailwind token classes.
const badgeVariants = cva(
	'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground',
				secondary: 'bg-secondary text-secondary-foreground',
				outline: 'border-border text-foreground',
				destructive: 'bg-destructive text-white',
			},
		},
		defaultVariants: { variant: 'default' },
	},
);

export type AppBadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

@Component({
	selector: 'app-badge',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { '[class]': 'computedClass()' },
	template: '<ng-content />',
})
export class BadgeComponent {
	readonly variant = input<AppBadgeVariant>('default');
	// Extra utilities the caller passes through (e.g. a rating tint).
	readonly classes = input<string>('', { alias: 'class' });
	protected readonly computedClass = computed(() =>
		`${badgeVariants({ variant: this.variant() })} ${this.classes()}`.trim(),
	);
}

export const BadgeImports = [BadgeComponent] as const;
