import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4">
          <DialogTitle className="text-base md:text-lg font-semibold">Logout</DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Are you sure you want to logout?
          </DialogDescription>
        </DialogHeader>

        <div className="border-t px-5 py-5 flex flex-col items-center gap-3">
          <div className="flex items-start w-full justify-start">
            <TriangleAlert
              className="w-17.5 h-17.5 text-destructive"
              strokeWidth={1.75}
            />
          </div>
          <p className="text-sm text-foreground text-left leading-relaxed">
            You&apos;ll need to sign in again to access the admin dashboard. Any
            unsaved changes will be lost.
          </p>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full bg-destructive hover:bg-red-600 text-white"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Yes, Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
