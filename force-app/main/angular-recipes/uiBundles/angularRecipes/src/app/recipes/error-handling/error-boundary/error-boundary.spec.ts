import { TestBed } from '@angular/core/testing';
import { ErrorBoundaryComponent } from './error-boundary';

describe('ErrorBoundaryComponent', () => {
	it('contains the failure and shows a fallback, then resets', async () => {
		await TestBed.configureTestingModule({ imports: [ErrorBoundaryComponent] }).compileComponents();
		const fixture = TestBed.createComponent(ErrorBoundaryComponent);
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('rendered successfully');

		const buttons = () => fixture.nativeElement.querySelectorAll('app-button button');
		(buttons()[0] as HTMLButtonElement).click();
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Caught the failure');
		expect(fixture.nativeElement.textContent).toContain('intentionally threw');

		// Try Again is the second button once the fallback is showing.
		(buttons()[1] as HTMLButtonElement).click();
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('rendered successfully');
	});
});
