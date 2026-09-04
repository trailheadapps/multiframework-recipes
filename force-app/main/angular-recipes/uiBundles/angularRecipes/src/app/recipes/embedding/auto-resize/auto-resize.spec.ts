import { TestBed } from '@angular/core/testing';
import { AutoResizeComponent } from './auto-resize';

// AutoResize keeps only local state — the SDK auto-reports body height — so no
// platform-sdk mock is needed here.
async function render() {
	await TestBed.configureTestingModule({ imports: [AutoResizeComponent] }).compileComponents();
	const fixture = TestBed.createComponent(AutoResizeComponent);
	await fixture.whenStable();
	fixture.detectChanges();
	return fixture;
}

describe('AutoResizeComponent', () => {
	it('starts with two items', async () => {
		const fixture = await render();
		expect(fixture.nativeElement.querySelectorAll('li').length).toBe(2);
		expect(fixture.nativeElement.textContent).toContain('2 items');
	});

	it('adds an item', async () => {
		const fixture = await render();
		const addButton = fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement;
		addButton.click();
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelectorAll('li').length).toBe(3);
	});

	it('removes an item', async () => {
		const fixture = await render();
		const remove = fixture.nativeElement.querySelector(
			'li button[aria-label="Remove item"]',
		) as HTMLButtonElement;
		remove.click();
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelectorAll('li').length).toBe(1);
	});
});
