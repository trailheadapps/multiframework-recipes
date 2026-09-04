import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonImports } from '../../../components/ui/button/button';

/**
 * Error Boundary (the Angular way)
 *
 * Angular has no render-time error boundary like React's class components or
 * LWC's errorCallback. A throw during change detection tears down the view and
 * is reported to the application's ErrorHandler (registered globally, e.g. via
 * provideBrowserGlobalErrorListeners or a custom ErrorHandler in app.config).
 *
 * To contain a failure to one region — the job a boundary does in React — you
 * guard the risky work yourself and surface the failure through a signal so the
 * template renders a fallback instead of crashing. Click "Break It" to trigger a
 * failure, then "Try Again" to reset.
 *
 * @see LoadingErrorEmptyComponent — explicit loading/error/empty states
 */
@Component({
	selector: 'app-error-boundary',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports],
	templateUrl: './error-boundary.html',
})
export class ErrorBoundaryComponent {
	protected readonly error = signal<string | undefined>(undefined);

	protected breakIt(): void {
		try {
			this.renderWidget();
		} catch (err) {
			// Contain the failure here rather than letting it reach the global
			// ErrorHandler and tear down the view.
			this.error.set(err instanceof Error ? err.message : 'Render failed');
		}
	}

	protected reset(): void {
		this.error.set(undefined);
	}

	// Stands in for risky work — building a widget, parsing a response, etc.
	private renderWidget(): void {
		throw new Error('Render error: the widget intentionally threw');
	}
}
