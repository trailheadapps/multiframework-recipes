/**
 * Icons — Lucide React
 *
 * Lucide icons are individual React components, not SVG sprites. Each is
 * tree-shaken, stroke-based, and sized via className. Great for custom UIs
 * that don't need to match the Salesforce visual system.
 *
 * @see IconsDSR — same icons with design-system-react Icon component
 */
import {
  Home,
  Settings,
  Plus,
  Trash2,
  Search,
  Pencil,
  User,
  Building2,
  TrendingUp,
  Users,
  Briefcase,
  CheckSquare,
  Bell,
  Mail,
  Calendar,
  ChevronRight,
  Star,
  Lock,
  Upload,
  Download,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type IconEntry = { icon: LucideIcon; name: string };

const ICONS: IconEntry[] = [
  { icon: Home, name: 'Home' },
  { icon: Settings, name: 'Settings' },
  { icon: Plus, name: 'Plus' },
  { icon: Trash2, name: 'Trash2' },
  { icon: Search, name: 'Search' },
  { icon: Pencil, name: 'Pencil' },
  { icon: User, name: 'User' },
  { icon: Building2, name: 'Building2' },
  { icon: TrendingUp, name: 'TrendingUp' },
  { icon: Users, name: 'Users' },
  { icon: Briefcase, name: 'Briefcase' },
  { icon: CheckSquare, name: 'CheckSquare' },
  { icon: Bell, name: 'Bell' },
  { icon: Mail, name: 'Mail' },
  { icon: Calendar, name: 'Calendar' },
  { icon: ChevronRight, name: 'ChevronRight' },
  { icon: Star, name: 'Star' },
  { icon: Lock, name: 'Lock' },
  { icon: Upload, name: 'Upload' },
  { icon: Download, name: 'Download' },
];

export default function IconsLucide() {
  return (
    <ul className="flex flex-wrap gap-4 list-none p-0 m-0">
      {ICONS.map(({ icon: IconComponent, name }) => (
        <li
          key={name}
          className="flex flex-col items-center gap-1.5 min-w-[4.5rem]"
        >
          <span className="flex items-center justify-center w-8 h-8">
            <IconComponent
              className="h-5 w-5 text-foreground"
              aria-hidden="true"
            />
          </span>
          <span className="text-[0.65rem] text-muted-foreground text-center leading-tight">
            {name}
          </span>
        </li>
      ))}
    </ul>
  );
}
