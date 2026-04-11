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
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-6 px-6">
        <button
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <Code2 className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight">React Recipes</span>
        </button>

        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label }) => {
            const isActive = pathname === to || pathname.startsWith(to + '/');
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
