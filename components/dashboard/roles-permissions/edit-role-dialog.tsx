"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoPersonOutline } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataState } from "@/components/shared/data-state";
import { PermissionPicker } from "./permission-picker";
import { RoleSavedDialog } from "./success-dialog";
import {
  editRoleSchema,
  type EditRoleValues,
} from "@/lib/validations/permissions";
import { useRole, useUpdateRole } from "@/hooks/admin/use-roles";
import { toErrorMessage } from "@/lib/api/errors";
import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { FloatingLabelTextarea } from "@/components/shared/form/floating-label-text-area";
import type { RoleDetailsDto } from "@/types/api/admin";
import type { RoleRow } from "@/types/permission";

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleRow;
}

/**
 * Edit flow behind `PUT /api/admin/roles/{roleId}`.
 *
 * The table row carries no permission ids, so the dialog fetches the role
 * detail to learn what is already assigned before letting anything be changed.
 */
export function EditRoleDialog({
  open,
  onOpenChange,
  role,
}: EditRoleDialogProps) {
  const [saved, setSaved] = useState(false);
  const detail = useRole(open ? role.id : undefined);

  if (saved) {
    return (
      <RoleSavedDialog
        open
        title="Changes Saved Successfully"
        description={`The ${role.name} role has been updated successfully.`}
        onClose={() => {
          setSaved(false);
          onOpenChange(false);
        }}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit role</DialogTitle>
        </DialogHeader>

        <DataState>
          <DataState.Error
            when={detail.isError}
            error={detail.error}
            onRetry={() => detail.refetch()}
          />
          <DataState.Loading when={detail.isPending} rows={8} rowClassName="h-10" />
          <DataState.Content>
            {/* Mounting only once the detail is in hand lets the form and the
                permission selection initialise from it directly, with no effect
                syncing server state into local state after the fact. */}
            {detail.data && (
              <EditRoleForm
                roleId={role.id}
                detail={detail.data}
                onCancel={() => onOpenChange(false)}
                onSaved={() => setSaved(true)}
              />
            )}
          </DataState.Content>
        </DataState>
      </DialogContent>
    </Dialog>
  );
}

function EditRoleForm({
  roleId,
  detail,
  onCancel,
  onSaved,
}: {
  roleId: string;
  detail: RoleDetailsDto;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [permissionIds, setPermissionIds] = useState<string[]>(
    detail.assignedPermissionIds ?? []
  );
  const updateRole = useUpdateRole();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditRoleValues>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      name: detail.name ?? "",
      description: detail.description ?? "",
    },
  });

  const onSubmit = (values: EditRoleValues) => {
    updateRole.mutate(
      {
        roleId,
        name: values.name,
        // The API takes `description` as nullable; an empty box means "none".
        description: values.description?.trim() ? values.description.trim() : null,
        permissionIds,
      },
      { onSuccess: onSaved }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FloatingLabelInput
        icon={<IoPersonOutline className="size-5" />}
        label="Role Name"
        error={errors.name?.message}
        {...register("name")}
      />

      <FloatingLabelTextarea
        label="Description"
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="max-h-[50vh] overflow-y-auto pr-1">
        <PermissionPicker
          value={permissionIds}
          onChange={setPermissionIds}
          disabled={updateRole.isPending}
        />
      </div>

      {updateRole.isError && (
        <p role="alert" className="text-sm text-destructive">
          {toErrorMessage(updateRole.error)}
        </p>
      )}

      <DialogFooter className="justify-between">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          disabled={updateRole.isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="flex-1 bg-primary hover:bg-emerald-700"
          isLoading={updateRole.isPending}
        >
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}
