/**
 * Button — shadcn/ui
 *
 * Button variants from shadcn/ui using Tailwind CSS and class-variance-authority.
 * Ideal for custom UIs that don't need to match the Salesforce look and feel.
 * This is the button system used throughout this app's own shell.
 *
 * @see ButtonDSR — same buttons with design-system-react components
 */
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, Upload } from 'lucide-react';

export default function ButtonShadcn() {
  return (
    <div className="space-y-6">
      {/* Variants */}
      <section>
        <h3 className="slds-text-heading_small slds-m-bottom_small">
          Variants
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      {/* Sizes */}
      <section>
        <h3 className="slds-text-heading_small slds-m-bottom_small">Sizes</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add">
            <Plus />
          </Button>
        </div>
      </section>

      {/* Disabled */}
      <section>
        <h3 className="slds-text-heading_small slds-m-bottom_small">
          Disabled
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button disabled>Default</Button>
          <Button variant="destructive" disabled>
            Destructive
          </Button>
          <Button variant="outline" disabled>
            Outline
          </Button>
        </div>
      </section>

      {/* With icons */}
      <section>
        <h3 className="slds-text-heading_small slds-m-bottom_small">
          With Icons
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button>
            <Plus />
            New Record
          </Button>
          <Button variant="destructive">
            <Trash2 />
            Delete
          </Button>
          <Button variant="outline">
            Options
            <ChevronDown />
          </Button>
          <Button variant="secondary">
            <Upload />
            Upload
          </Button>
        </div>
      </section>
    </div>
  );
}
