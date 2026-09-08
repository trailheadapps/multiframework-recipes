import { TestBed } from '@angular/core/testing';
import { ButtonSldsComponent } from './button-slds';

describe('ButtonSldsComponent', () => {
	it('renders an SLDS button per variant', async () => {
		await TestBed.configureTestingModule({ imports: [ButtonSldsComponent] }).compileComponents();
		const fixture = TestBed.createComponent(ButtonSldsComponent);
		fixture.detectChanges();
		const el = fixture.nativeElement as HTMLElement;
		expect(el.querySelector('.slds-button_brand')).toBeTruthy();
		expect(el.querySelector('.slds-button_destructive')).toBeTruthy();
		expect(el.querySelectorAll('button').length).toBeGreaterThanOrEqual(6);
	});
});
