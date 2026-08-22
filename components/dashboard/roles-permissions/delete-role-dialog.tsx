"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { RoleSavedDialog } from "./success-dialog";
import {
  makeDeleteRoleSchema,
  type DeleteRoleValues,
} from "@/lib/validations/permissions";
import { useDeleteRole } from "@/hooks/admin/use-roles";
import { toErrorMessage } from "@/lib/api/errors";
import type { RoleRow } from "@/types/role";

interface DeleteRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleRow;
}

/**
 * Delete flow behind `DELETE /api/admin/roles/{roleId}`.
 *
 * The API takes the role's name in the body and checks it, so the typed
 * confirmation is the value that actually gets sent — not just a UI gate.
 */
export function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
}: DeleteRoleDialogProps) {
  const [deleted, setDeleted] = useState(false);
  const deleteRole = useDeleteRole();

  const schema = useMemo(() => makeDeleteRoleSchema(role.name), [role.name]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteRoleValues>({
    resolver: zodResolver(schema),
    defaultValues: { confirmName: "" },
  });

  const onSubmit = ({ confirmName }: DeleteRoleValues) => {
    deleteRole.mutate(
      { roleId: role.id, roleName: confirmName.trim() },
      { onSuccess: () => setDeleted(true) },
    );
  };

  if (deleted) {
    return (
      <RoleSavedDialog
        open
        title="Role Deleted Successfully"
        description={`The ${role.name} role has been deleted successfully.`}
        onClose={() => {
          setDeleted(false);
          onOpenChange(false);
        }}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Delete role
          </DialogTitle>
          <DialogDescription>
            Deleting the <span className="font-medium">{role.name}</span> role
            removes its permissions from everyone assigned to it. Type the role
            name to confirm.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FloatingLabelInput
            label="Role Name"
            autoComplete="off"
            error={errors.confirmName?.message}
            {...register("confirmName")}
          />

          {deleteRole.isError && (
            <p role="alert" className="text-sm text-destructive">
              {toErrorMessage(deleteRole.error)}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full"
              disabled={deleteRole.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="flex-1 rounded-full"
              isLoading={deleteRole.isPending}
            >
              Delete role
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
