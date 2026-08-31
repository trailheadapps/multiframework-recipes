import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found';

describe('NotFoundComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [NotFoundComponent],
			providers: [provideRouter([])],
		}).compileComponents();
	});

	it('should create the component', () => {
		const fixture = TestBed.createComponent(NotFoundComponent);
		const component = fixture.componentInstance;
		expect(component).toBeTruthy();
	});

	it('should render main landmark', async () => {
		const fixture = TestBed.createComponent(NotFoundComponent);
		await fixture.whenStable();
		const compiled = fixture.nativeElement as HTMLElement;
		expect(compiled.querySelector('main')).toBeTruthy();
	});

	it('should have a link to home', async () => {
		const fixture = TestBed.createComponent(NotFoundComponent);
		await fixture.whenStable();
		const compiled = fixture.nativeElement as HTMLElement;
		const link = compiled.querySelector('a');
		expect(link?.getAttribute('href')).toBe('/');
	});
});
