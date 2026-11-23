// Hides the platform's "Logged in as" banner when this app is framed.
// Must be an external, classic script in <head> (no module/async/defer): the
// platform checks for the tag once at load, and the bundle CSP blocks inline
// scripts. Served as immutable, so rename the file if you change it.
if (window.self !== window.top) {
  const meta = document.createElement('meta');
  meta.name = 'sf-session-banner';
  meta.content = 'disabled';
  document.head.appendChild(meta);
}
