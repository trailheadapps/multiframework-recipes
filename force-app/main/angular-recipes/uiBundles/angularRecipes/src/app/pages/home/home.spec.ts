import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home';

describe('HomeComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HomeComponent],
			providers: [provideRouter([])],
		}).compileComponents();
	});

	it('should create the component', () => {
		const fixture = TestBed.createComponent(HomeComponent);
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should render main landmark', async () => {
		const fixture = TestBed.createComponent(HomeComponent);
		await fixture.whenStable();
		const compiled = fixture.nativeElement as HTMLElement;
		expect(compiled.querySelector('main')).toBeTruthy();
	});

	it('should render a category tile for Hello', async () => {
		const fixture = TestBed.createComponent(HomeComponent);
		await fixture.whenStable();
		const compiled = fixture.nativeElement as HTMLElement;
		expect(compiled.textContent).toContain('Hello');
		expect(compiled.textContent).toContain('8 recipes');
	});
});
