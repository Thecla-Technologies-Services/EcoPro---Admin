"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { PermissionPicker } from "./permission-picker";
import { RoleSavedDialog } from "./success-dialog";
import {
  roleDetailsSchema,
  type RoleDetailsValues,
} from "@/lib/validations/permissions";
import { useCreateRole } from "@/hooks/admin/use-roles";
import { toErrorMessage } from "@/lib/api/errors";
import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { FloatingLabelTextarea } from "@/components/shared/form/floating-label-text-area";

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Two-step create flow behind `POST /api/admin/roles`. */
export function CreateRoleDialog({
  open,
  onOpenChange,
}: CreateRoleDialogProps) {
  const [step, setStep] = useState<"details" | "permissions">("details");
  const [permissionIds, setPermissionIds] = useState<string[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);

  const createRole = useCreateRole();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<RoleDetailsValues>({
    resolver: zodResolver(roleDetailsSchema),
    defaultValues: { name: "", description: "" },
  });

  const closeAndReset = () => {
    onOpenChange(false);
    // Wait for the close animation before wiping the contents.
    setTimeout(() => {
      reset();
      setStep("details");
      setPermissionIds([]);
      setPermissionError(null);
      createRole.reset();
    }, 200);
  };

  const handleCreateRole = () => {
    if (permissionIds.length === 0) {
      setPermissionError("Select at least one permission");
      return;
    }
    setPermissionError(null);

    const { name, description } = getValues();

    createRole.mutate(
      {
        name,
        // The API takes `description` as nullable; an empty box means "none".
        description: description?.trim() ? description.trim() : null,
        permissionIds,
      },
      { onSuccess: (role) => setCreatedName(role?.name ?? name) },
    );
  };

  if (createdName) {
    return (
      <RoleSavedDialog
        open
        title="Role Created Successfully"
        description={`The ${createdName} role has been created successfully.`}
        onClose={() => {
          setCreatedName(null);
          closeAndReset();
        }}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeAndReset()}>
      <DialogContent
        className={step === "permissions" ? "max-w-3xl" : "max-w-md"}
      >
        {step === "details" ? (
          <>
            <DialogHeader>
              <DialogTitle>Create role</DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(() => setStep("permissions"))}
              className="space-y-4"
            >
              <FloatingLabelInput
                icon={<UserRound className="h-3 w-3" />}
                label="Role Name"
                error={errors.name?.message || ""}
                {...register("name")}
              />

              <FloatingLabelTextarea
                label="Description"
                error={errors.description?.message}
                {...register("description")}
              />

              <DialogFooter className="justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={closeAndReset}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-emerald-700"
                >
                  Create &amp; continue
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Assign permission</DialogTitle>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <PermissionPicker
                value={permissionIds}
                onChange={(next) => {
                  setPermissionIds(next);
                  setPermissionError(null);
                }}
                disabled={createRole.isPending}
              />
            </div>

            {(permissionError || createRole.isError) && (
              <p role="alert" className="text-sm text-destructive">
                {permissionError ?? toErrorMessage(createRole.error)}
              </p>
            )}

            <DialogFooter className="justify-between">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                disabled={createRole.isPending}
                onClick={() => setStep("details")}
              >
                Back
              </Button>

              <Button
                type="button"
                className="flex-1 bg-primary hover:bg-emerald-700"
                isLoading={createRole.isPending}
                onClick={handleCreateRole}
              >
                Create role
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
