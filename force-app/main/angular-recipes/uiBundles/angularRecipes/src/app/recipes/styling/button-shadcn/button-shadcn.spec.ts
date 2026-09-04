import { TestBed } from '@angular/core/testing';
import { ButtonShadcnComponent } from './button-shadcn';

describe('ButtonShadcnComponent', () => {
	it('renders the app button in several appearances', async () => {
		await TestBed.configureTestingModule({ imports: [ButtonShadcnComponent] }).compileComponents();
		const fixture = TestBed.createComponent(ButtonShadcnComponent);
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.querySelectorAll('app-button button').length).toBeGreaterThanOrEqual(10);
		expect(el.textContent).toContain('Filled');
		expect(el.textContent).toContain('New Record');
	});
});
