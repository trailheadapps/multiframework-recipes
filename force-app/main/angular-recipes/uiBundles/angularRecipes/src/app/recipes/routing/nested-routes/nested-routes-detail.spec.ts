import { TestBed } from '@angular/core/testing';
import { NestedRoutesDetailComponent } from './nested-routes-detail';
import { NestedRoutesStore } from './nested-routes-store';

describe('NestedRoutesDetailComponent', () => {
	it('shows the account matching the bound accountId from the shared store', async () => {
		const store = new NestedRoutesStore();
		store.accounts.set([{ id: '001A', name: 'Acme', industry: 'Technology' }]);
		store.loaded.set(true);

		await TestBed.configureTestingModule({
			imports: [NestedRoutesDetailComponent],
			providers: [{ provide: NestedRoutesStore, useValue: store }],
		}).compileComponents();
		const fixture = TestBed.createComponent(NestedRoutesDetailComponent);
		fixture.componentRef.setInput('accountId', '001A');
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Acme');
		expect(fixture.nativeElement.textContent).toContain('Technology');
	});
});
