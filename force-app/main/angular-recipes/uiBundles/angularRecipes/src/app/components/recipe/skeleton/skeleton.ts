import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

// Loading placeholder, mirroring the LWC lightning-skeleton-text /
// lightning-skeleton-avatar API. Usage:
//   <app-skeleton [lines]="3" />       — stacked text lines
//   <app-skeleton variant="avatar" />  — circular avatar
const LINE_WIDTHS = ['100%', '75%', '50%', '90%', '65%', '80%', '45%'];

@Component({
	selector: 'app-skeleton',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './skeleton.html',
})
export class SkeletonComponent {
	readonly variant = input<'text' | 'avatar'>('text');
	readonly lines = input(1);

	protected readonly widths = LINE_WIDTHS;
	protected readonly rows = computed(() => Array.from({ length: this.lines() }, (_, i) => i));
}
