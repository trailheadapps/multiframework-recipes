import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideNgIconsConfig } from '@ng-icons/core';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		// withComponentInputBinding lets route params (e.g. :accountId) bind straight
		// to a component's signal input() — see the Routing recipes.
		provideRouter(routes, withComponentInputBinding()),
		provideNgIconsConfig({ size: '1rem' }),
	],
};
