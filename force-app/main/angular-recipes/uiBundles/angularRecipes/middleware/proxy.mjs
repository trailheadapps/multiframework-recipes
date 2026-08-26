/**
 * Proxy middleware for Angular CLI dev server.
 *
 * Forwards `/services/*` and other manifest-routed paths to the connected
 * Salesforce org with authentication. Watches `ui-bundle.json` for changes
 * and recreates the proxy handler automatically (manual browser refresh needed).
 *
 * Referenced from angular.json: architect.serve.options.middlewares[].
 */
import { createProxyMiddleware } from '@salesforce/angular-plugin-ui-bundle';

export default await createProxyMiddleware();
