/**
 * Button — shadcn/ui
 *
 * Button variants from shadcn/ui using Tailwind CSS and class-variance-authority.
 * Ideal for custom UIs that don't need to match the Salesforce look and feel.
 * This is the button system used throughout this app's own shell.
 *
 * @see ButtonSLDS — same buttons with SLDS blueprint CSS classes
 */
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, Upload } from 'lucide-react';

export default function ButtonShadcn() {
  return (
    <div className="space-y-6">
      {/* Variants */}
      <section>
        <h3 className="text-sm font-bold mb-3">Variants</h3>
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
        <h3 className="text-sm font-bold mb-3">Sizes</h3>
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
        <h3 className="text-sm font-bold mb-3">Disabled</h3>
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
        <h3 className="text-sm font-bold mb-3">With Icons</h3>
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
