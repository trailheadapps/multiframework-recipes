import { TestBed } from '@angular/core/testing';
import { IconsLucideComponent } from './icons-lucide';

describe('IconsLucideComponent', () => {
	it('renders an ng-icon per entry', async () => {
		await TestBed.configureTestingModule({ imports: [IconsLucideComponent] }).compileComponents();
		const fixture = TestBed.createComponent(IconsLucideComponent);
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.querySelectorAll('ng-icon')).toHaveLength(20);
		expect(el.textContent).toContain('Home');
		expect(el.textContent).toContain('Download');
	});
});
