/**
 * SLDS Icons — SVG Sprite References
 *
 * SLDS icons live in SVG sprite sheets served from /assets/icons/. Reference
 * them via <use href="/assets/icons/{sprite}/svg/symbols.svg#{name}" />.
 * There is no <lightning-icon> React equivalent -- you own this markup.
 *
 * @see IconsLucide — Lucide React icons (tree-shakable components)
 */

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

type IconCategory = {
  label: string;
  sprite: string;
  names: string[];
  containerClass: (name: string) => string;
};

const CATEGORIES: IconCategory[] = [
  {
    label: 'Utility',
    sprite: 'utility-sprite',
    names: UTILITY_ICONS,
    containerClass: () => 'slds-icon_container',
  },
  {
    label: 'Standard',
    sprite: 'standard-sprite',
    names: STANDARD_ICONS,
    containerClass: name => `slds-icon_container slds-icon-standard-${name}`,
  },
  {
    label: 'Action',
    sprite: 'action-sprite',
    names: ACTION_ICONS,
    // sprite names use underscores; CSS classes use hyphens
    containerClass: name =>
      `slds-icon_container slds-icon_container_circle slds-icon-action-${name.replace(/_/g, '-')}`,
  },
];

export default function IconsSLDS() {
  return (
    <div>
      {CATEGORIES.map(({ label, sprite, names, containerClass }) => (
        <section key={label} className="slds-m-bottom_medium">
          <h3 className="slds-text-heading_small slds-m-bottom_small">
            {label}
          </h3>
          <ul className="slds-grid slds-wrap slds-gutters_small">
            {names.map(name => (
              <li
                key={name}
                className="slds-col slds-p-around_x-small slds-text-align_center"
                style={{ minWidth: '4.5rem' }}
              >
                <span className={containerClass(name)} title={name}>
                  <svg className="slds-icon slds-icon_small" aria-hidden="true">
                    <use
                      href={`/assets/icons/${sprite}/svg/symbols.svg#${name}`}
                    />
                  </svg>
                  <span className="slds-assistive-text">{name}</span>
                </span>
                <p className="slds-text-color_weak slds-m-top_xx-small slds-text-body_small">
                  {name}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
