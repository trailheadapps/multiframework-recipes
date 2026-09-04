import { TestBed } from '@angular/core/testing';
import { NestedRoutesIndexComponent } from './nested-routes-index';

describe('NestedRoutesIndexComponent', () => {
	it('prompts the user to select an account', async () => {
		await TestBed.configureTestingModule({
			imports: [NestedRoutesIndexComponent],
		}).compileComponents();
		const fixture = TestBed.createComponent(NestedRoutesIndexComponent);
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Select an account');
	});
});
