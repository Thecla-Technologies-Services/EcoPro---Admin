import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";

interface RoleSavedDialogProps {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

/** Shared confirmation shown after a role is created, updated or deleted. */
export function RoleSavedDialog({
  open,
  title,
  description,
  onClose,
}: RoleSavedDialogProps) {
  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onClose}
      status="user"
      title={title}
      description={description}
    >
      <Button
        className="w-full bg-primary text-white rounded-full"
        onClick={onClose}
      >
        Done
      </Button>
    </ConfirmActionDialog>
  );
}
