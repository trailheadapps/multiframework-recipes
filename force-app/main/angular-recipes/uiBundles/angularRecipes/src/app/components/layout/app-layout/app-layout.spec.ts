import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, type Route } from '@angular/router';
import { AppLayoutComponent } from './app-layout';

const layoutRoute: Route = {
	path: '',
	children: [
		{ path: '' },
		{ path: 'hello', data: { showInNavigation: true, label: 'Hello' } },
		{ path: '**' },
	],
};

describe('AppLayoutComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AppLayoutComponent],
			providers: [
				provideRouter([]),
				// The component derives its nav from the layout route's children.
				{ provide: ActivatedRoute, useValue: { routeConfig: layoutRoute } },
			],
		}).compileComponents();
	});

	it('should create the component', () => {
		const fixture = TestBed.createComponent(AppLayoutComponent);
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should expose category navigation items', () => {
		const fixture = TestBed.createComponent(AppLayoutComponent);
		const items = fixture.componentInstance.navigationItems;
		expect(items.length).toBeGreaterThan(0);
		expect(items[0].path).toBe('/hello');
	});

	it('should render the header, nav, and search bar', async () => {
		const fixture = TestBed.createComponent(AppLayoutComponent);
		await fixture.whenStable();
		const compiled = fixture.nativeElement as HTMLElement;
		expect(compiled.querySelector('header')).toBeTruthy();
		expect(compiled.querySelector('nav')).toBeTruthy();
		expect(compiled.querySelector('app-search-bar')).toBeTruthy();
	});
});
