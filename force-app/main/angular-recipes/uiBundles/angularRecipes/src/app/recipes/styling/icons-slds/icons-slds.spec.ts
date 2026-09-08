import { TestBed } from '@angular/core/testing';
import { IconsSldsComponent } from './icons-slds';

describe('IconsSldsComponent', () => {
	it('renders sprite <use> references for utility and standard icons', async () => {
		await TestBed.configureTestingModule({ imports: [IconsSldsComponent] }).compileComponents();
		const fixture = TestBed.createComponent(IconsSldsComponent);
		fixture.detectChanges();
		const uses = Array.from(fixture.nativeElement.querySelectorAll('use')) as SVGUseElement[];
		expect(uses.length).toBe(12);
		const hrefs = uses.map((u) => u.getAttribute('href'));
		expect(hrefs).toContain('/assets/icons/utility-sprite/svg/symbols.svg#home');
		expect(hrefs).toContain('/assets/icons/standard-sprite/svg/symbols.svg#account');
		expect(fixture.nativeElement.querySelector('.slds-icon-standard-account')).toBeTruthy();
	});
});
