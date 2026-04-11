/**
 * SLDS Icons — design-system-react
 *
 * Same icons as IconsSLDS via the Icon component from design-system-react.
 * Wrap any Icon usage in IconSettings to configure the sprite base path.
 *
 * @see SearchableAccountList — combining search, debounce, and data fetching
 */
import { Icon, IconSettings } from '@salesforce/design-system-react';

const UTILITY_ICONS = ['home', 'settings', 'add', 'delete', 'search', 'edit'];
const STANDARD_ICONS = [
  'account',
  'contact',
  'opportunity',
  'lead',
  'case',
  'task',
];
const ACTION_ICONS = [
  'new_note',
  'edit',
  'delete',
  'share',
  'log_a_call',
  'new_account',
];

type IconGroup = { label: string; category: string; names: string[] };

const GROUPS: IconGroup[] = [
  { label: 'Utility', category: 'utility', names: UTILITY_ICONS },
  { label: 'Standard', category: 'standard', names: STANDARD_ICONS },
  { label: 'Action', category: 'action', names: ACTION_ICONS },
];

export default function IconsDSR() {
  return (
    // IconSettings tells DSR where the sprites are served from
    <IconSettings iconPath="/assets/icons">
      <div>
        {GROUPS.map(({ label, category, names }) => (
          <section key={label} className="slds-m-bottom_medium">
            <h3 className="slds-text-heading_small slds-m-bottom_small">
              {label}
            </h3>
            <ul className="slds-grid slds-wrap slds-gutters_small">
              {names.map(name => (
                <li
                  key={name}
                  className="slds-col slds-p-around_x-small slds-grid slds-grid_vertical slds-grid_align-center"
                  style={{ minWidth: '4.5rem', alignItems: 'center' }}
                >
                  <Icon
                    assistiveText={{ label: name }}
                    category={category}
                    name={name}
                    size="small"
                  />
                  <p className="slds-text-color_weak slds-m-top_xx-small slds-text-body_small">
                    {name}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </IconSettings>
  );
}
