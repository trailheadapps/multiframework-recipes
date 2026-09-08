import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LinkDemoComponent } from './link-demo';

describe('LinkDemoComponent', () => {
	it('renders a routerLink per app page', async () => {
		await TestBed.configureTestingModule({
			imports: [LinkDemoComponent],
			providers: [provideRouter([])],
		}).compileComponents();
		const fixture = TestBed.createComponent(LinkDemoComponent);
		fixture.detectChanges();
		const links = fixture.nativeElement.querySelectorAll('a');
		expect(links).toHaveLength(6);
		expect(links[0].getAttribute('href')).toBe('/hello');
		expect(links[5].getAttribute('href')).toBe('/routing');
	});
});
