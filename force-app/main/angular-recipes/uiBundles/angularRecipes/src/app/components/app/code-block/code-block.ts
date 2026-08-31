import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
	output,
	signal,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCopy } from '@ng-icons/lucide';

/** One source tab — a labelled block of pre-rendered shiki HTML. */
export interface RecipeSource {
	/** Tab label (e.g. "TS", "HTML"). */
	label: string;
	/** Pre-highlighted HTML from a `?shiki` import. */
	html: string;
}

/**
 * The dark "view source" panel next to each recipe. An Angular recipe spans a
 * `.ts` and an `.html` file, so the panel shows one tab per file and renders the
 * shiki HTML produced at build time (see esbuild/shiki.mjs).
 */
@Component({
	selector: 'app-code-block',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgIcon],
	providers: [provideIcons({ lucideCopy, lucideCheck })],
	templateUrl: './code-block.html',
})
export class CodeBlockComponent {
	private readonly sanitizer = inject(DomSanitizer);

	readonly sources = input.required<readonly RecipeSource[]>();
	readonly expanded = input(false);
	readonly toggleExpand = output<void>();

	protected readonly activeIndex = signal(0);
	protected readonly copied = signal(false);

	// The shiki HTML is trusted, build-time content (no user input), so bypass
	// Angular's sanitizer — otherwise it would strip the inline token colors.
	protected readonly activeHtml = computed<SafeHtml>(() =>
		this.sanitizer.bypassSecurityTrustHtml(this.sources()[this.activeIndex()]?.html ?? ''),
	);

	protected select(index: number): void {
		this.activeIndex.set(index);
	}

	protected copy(): void {
		// Strip HTML tags to recover the plain source of the active tab.
		const html = this.sources()[this.activeIndex()]?.html ?? '';
		const text = new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
		navigator.clipboard.writeText(text).then(() => {
			this.copied.set(true);
			setTimeout(() => this.copied.set(false), 2000);
		});
	}
}
