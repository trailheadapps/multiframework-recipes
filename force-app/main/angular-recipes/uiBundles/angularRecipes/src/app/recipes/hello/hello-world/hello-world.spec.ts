import { TestBed } from '@angular/core/testing';
import { HelloWorldComponent } from './hello-world';

describe('HelloWorldComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({ imports: [HelloWorldComponent] }).compileComponents();
	});

	it('renders the greeting', async () => {
		const fixture = TestBed.createComponent(HelloWorldComponent);
		await fixture.whenStable();
		expect((fixture.nativeElement as HTMLElement).textContent).toContain('Hello, World!');
	});
});
