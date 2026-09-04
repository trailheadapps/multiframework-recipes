import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { UseNavigateComponent } from './use-navigate';

describe('UseNavigateComponent', () => {
	afterEach(() => vi.useRealTimers());

	it('navigates to /read-data after the simulated save completes', async () => {
		vi.useFakeTimers();
		await TestBed.configureTestingModule({
			imports: [UseNavigateComponent],
			providers: [provideRouter([])],
		}).compileComponents();
		const router = TestBed.inject(Router);
		const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

		const fixture = TestBed.createComponent(UseNavigateComponent);
		fixture.detectChanges();
		// jsdom doesn't submit a form from a button click — dispatch submit directly.
		(fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
			new Event('submit'),
		);

		// Advance past the 1200ms save, then the 900ms navigate delay.
		await vi.advanceTimersByTimeAsync(1200);
		await vi.advanceTimersByTimeAsync(900);
		expect(navigate).toHaveBeenCalledWith(['/read-data']);
	});
});
