import { useLocation, useNavigate } from 'react-router';
import { Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import SearchBar from './SearchBar';

const navItems = [
  { to: '/hello', label: 'Hello' },
  { to: '/read-data', label: 'Read Data' },
  { to: '/modify-data', label: 'Modify Data' },
  { to: '/salesforce-apis', label: 'Salesforce APIs' },
  { to: '/integration', label: 'Integration' },
  { to: '/error-handling', label: 'Error Handling' },
  { to: '/styling', label: 'Styling' },
  { to: '/routing', label: 'Routing' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 border-b-2 border-b-primary/30 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-6">
        <button
          className="flex shrink-0 items-center gap-2 whitespace-nowrap transition-opacity hover:opacity-80"
          onClick={() => navigate('/')}
        >
          <Code2 className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight">React Recipes</span>
        </button>

        {/* Scrolls horizontally rather than wrapping when the row is tight
            (narrow windows, or the Lightning shell's reduced width). */}
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map(({ to, label }) => {
            const isActive = pathname === to || pathname.startsWith(to + '/');
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={cn(
                  'shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {label}
              </button>
            );
          })}

          {/* Embedding sits apart from the recipe categories — it's the guest
              side of the app, not another recipe. The rule signals that. */}
          <span className="bg-border/70 mx-1.5 h-4 w-px shrink-0" aria-hidden />
          <button
            onClick={() => navigate('/embedding')}
            className={cn(
              'shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
              pathname === '/embedding'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            Micro-Frontends
          </button>
        </nav>

        <div className="ml-auto shrink-0">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
