import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Hello World
 *
 * The simplest possible Salesforce web application component — a plain Angular
 * standalone component that renders a bound expression.
 *
 * @see BindingAccountNameComponent — fetching and binding Salesforce data
 */
@Component({
	selector: 'app-hello-world',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './hello-world.html',
})
export class HelloWorldComponent {
	protected readonly greeting = 'World';
}
