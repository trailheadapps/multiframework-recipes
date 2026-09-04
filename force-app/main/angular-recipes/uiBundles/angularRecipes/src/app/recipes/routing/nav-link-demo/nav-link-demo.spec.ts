import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavLinkDemoComponent } from './nav-link-demo';

describe('NavLinkDemoComponent', () => {
	it('renders active-aware nav links', async () => {
		await TestBed.configureTestingModule({
			imports: [NavLinkDemoComponent],
			providers: [provideRouter([])],
		}).compileComponents();
		const fixture = TestBed.createComponent(NavLinkDemoComponent);
		fixture.detectChanges();
		const links = fixture.nativeElement.querySelectorAll('nav a');
		expect(links).toHaveLength(6);
		expect(links[0].getAttribute('href')).toBe('/hello');
	});
});
