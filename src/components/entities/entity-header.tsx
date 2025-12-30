import Link from "next/link";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";

type EntityHeaderProps = {
  title: string;
  description?: string;
  newButtonLabel?: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { onNew?: never; newButtonHref: string }
  | { onNew?: never; newButtonHref?: never }
);

const EntityHeader = ({
  title,
  description,
  newButtonLabel,
  disabled,
  isCreating,
  onNew,
  newButtonHref,
}: EntityHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between gap-x-4">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold">{title}</h1>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {onNew && !newButtonHref && (
        <Button onClick={onNew} disabled={disabled || isCreating} size="sm">
          <PlusIcon size={4} />
          {newButtonLabel}
        </Button>
      )}
      {newButtonHref && !onNew && (
        <Button asChild disabled={disabled || isCreating} size="sm">
          <Link href={newButtonHref} prefetch>
            {newButtonLabel}
          </Link>
        </Button>
      )}
    </div>
  );
};

export default EntityHeader;
