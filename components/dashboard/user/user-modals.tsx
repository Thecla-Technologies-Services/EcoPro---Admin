"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { FloatingLabelInput } from "@/components/shared/floating-label-input";
import {
  useDeleteUser,
  useSuspendUser,
  useUnsuspendUser,
} from "@/hooks/admin/use-users";
import { toErrorMessage } from "@/lib/api/errors";
import type { ModalType, User } from "@/types/user";

interface UserActionModalsProps {
  user: User;
  modal: ModalType;
  onClose: () => void;
}



/**
 * These modals stay mounted for the life of the row, so their confirm → success
 * state outlives the flow it tracks: without this, a modal reopens on the
 * success screen it was left on. Clearing on open rather than on close keeps
 * the success copy on screen through the dialog's exit animation.
 */
function useResetOnOpen(open: boolean, reset: () => void) {
  // Held in a ref so only `open` drives the effect — depending on the callback
  // itself would re-run it on every render and clear the success state as soon
  // as the mutation set it.
  const latest = useRef(reset);
  latest.current = reset;

  useEffect(() => {
    if (open) latest.current();
  }, [open]);
}

function UserAvatar({ user }: { user: User }) {
  return (
    <Avatar className="size-20 mb-5">
      <AvatarImage src={user?.avatar} alt={user.name} />
      <AvatarFallback className="text-xl font-bold bg-muted">
        {user.name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}



function SuspendModal({
  user,
  open,
  onClose,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const suspendUser = useSuspendUser();

  useResetOnOpen(open, () => {
    setConfirmed(false);
    suspendUser.reset();
  });

  const handleSuspend = () => {
    // SuspendUserRequestDto accepts an optional `reason`, which this dialog
    // does not collect — see the note in the PR description.
    suspendUser.mutate(
      { userId: user.id },
      { onSuccess: () => setConfirmed(true) },
    );
  };

  if (confirmed) {
    return (
      <ConfirmActionDialog
        open={open}
        onOpenChange={onClose}
        title="User Suspend"
        description={`${user.name}'s account has been suspended. They will not be able to access the platform while suspended.`}
      >
        <Button
          className="w-full bg-primary text-white rounded-full"
          onClick={onClose}
        >
          Seen
        </Button>
      </ConfirmActionDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-xs md:max-w-sm gap-0 py-6 px-5">
        <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" />
        <UserAvatar user={user} />
        <DialogTitle className="text-lg font-semibold mb-2">Confirm User Suspension</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mb-6">
          You are about to suspend {user.name}. Once suspended, they will no
          longer be able to access the EcoSwap application until the account is
          reinstated.
        </DialogDescription>
        {suspendUser.isError && (
          <p role="alert" className="mb-4 text-sm text-destructive">
            {toErrorMessage(suspendUser.error)}
          </p>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={onClose}
            disabled={suspendUser.isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white"
            onClick={handleSuspend}
            isLoading={suspendUser.isPending}
          >
            Suspend
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Unsuspend Modal ───────────────────────────────────────────────────────────

function UnsuspendModal({
  user,
  open,
  onClose,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const unsuspendUser = useUnsuspendUser();

  useResetOnOpen(open, () => {
    setConfirmed(false);
    unsuspendUser.reset();
  });

  const handleUnsuspend = () => {
    unsuspendUser.mutate(user.id, { onSuccess: () => setConfirmed(true) });
  };

  if (confirmed) {
    return (
      <ConfirmActionDialog
        open={open}
        onOpenChange={onClose}
        title="User Unsuspend"
        description={`${user.name}'s account has been unsuspended. They can access the platform again.`}
      >
        <Button
          className="w-full bg-primary text-white rounded-full"
          onClick={onClose}
        >
          Seen
        </Button>
      </ConfirmActionDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-xs md:max-w-sm gap-0 py-6 px-5">
        <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" />
        <UserAvatar user={user} />
        <DialogTitle className="text-lg font-semibold mb-2">
          Confirm User Unsuspension
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mb-6">
          You are about to unsuspend {user.name}. Once unsuspended, they will be
          able to access the EcoSwap application again.
        </DialogDescription>
        {unsuspendUser.isError && (
          <p role="alert" className="mb-4 text-sm text-destructive">
            {toErrorMessage(unsuspendUser.error)}
          </p>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={onClose}
            disabled={unsuspendUser.isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full bg-primary text-white"
            onClick={handleUnsuspend}
            isLoading={unsuspendUser.isPending}
          >
            Unsuspend
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────

function DeleteModal({
  user,
  open,
  onClose,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const deleteUser = useDeleteUser();

  const deleteSchema = z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .refine((val) => val.trim().toLowerCase() === user.email.toLowerCase(), {
        message: "Email does not match",
      }),
  });

  type DeleteForm = z.infer<typeof deleteSchema>;

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isValid },
  } = useForm<DeleteForm>({
    defaultValues: { email: user.email },
    resolver: zodResolver(deleteSchema),
  });

  useResetOnOpen(open, () => {
    setConfirmed(false);
    deleteUser.reset();
    resetForm();
  });

  const onSubmit = (data: DeleteForm) => {
    // The API takes the typed-back address as `targetEmail`, which is the same
    // confirmation this form already demands.
    deleteUser.mutate(
      { userId: user.id, targetEmail: data.email },
      { onSuccess: () => setConfirmed(true) },
    );
  };

  if (confirmed) {
    return (
      <ConfirmActionDialog
        open={open}
        onOpenChange={onClose}
        title="User Deleted"
        description={`${user.name}'s account has been deleted. They will not have access to the platform again.`}
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

  return (
    <Dialog key={user.id} open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-xs md:max-w-sm gap-0 py-6 px-5">
        <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" />
        <UserAvatar user={user} />
        <DialogTitle className="text-lg font-semibold mb-2">Delete {user.name}</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mb-5">
          This will remove all user data, delete all listings and clear
          transaction history. This action{" "}
          <span className="font-semibold text-foreground">CANNOT</span> be
          undone. Type the user email to confirm.
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <p className="text-sm text-muted-foreground">
            To delete user, type the email address below:
          </p>
          <div>
            <FloatingLabelInput label={"Email"} {...register("email")} />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          {deleteUser.isError && (
            <p role="alert" className="text-sm text-destructive">
              {toErrorMessage(deleteUser.error)}
            </p>
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={onClose}
              disabled={deleteUser.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-full bg-destructive hover:bg-destructive/90 text-white"
              disabled={!isValid || deleteUser.isPending}
              isLoading={deleteUser.isPending}
            >
              Yes, Delete
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Change password ───────────────────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm the new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

/**
 * Sets a new password on a staff account.
 *
 * NOT WIRED: the API has no endpoint for an admin to set another account's
 * password. `POST /api/auth/change-password` acts on whoever is signed in and
 * takes no user id, and `forgot-password` only mails the account a code. The
 * form is complete and validated; submitting reports that the action is
 * unavailable rather than reporting a success that never happened. Wiring it up
 * means calling the endpoint from `onSubmit` once it exists.
 */
function ChangePasswordModal({
  user,
  open,
  onClose,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
}) {
  const [unavailable, setUnavailable] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset({ newPassword: "", confirmPassword: "" });
      setUnavailable(false);
      onClose();
    }
  };

  const onSubmit = () => setUnavailable(true);

  return (
    <Dialog key={user.id} open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xs md:max-w-sm gap-0 py-6 px-5"
      >
        <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" />
        <UserAvatar user={user} />
        <DialogTitle className="text-lg font-semibold mb-2">
          Change Password
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mb-5">
          Set a new password for {user.name}. They will need it the next time
          they sign in.
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <FloatingLabelInput
              label="New Password"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <FloatingLabelInput
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {unavailable && (
            <p role="alert" className="text-sm text-destructive">
              Changing a password from the dashboard is not available yet — the
              API has no endpoint for it. Nothing was changed.
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-full bg-primary text-white"
              disabled={!isValid}
            >
              Change Password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

export function UserActionModals({
  user,
  modal,
  onClose,
}: UserActionModalsProps) {
  return (
    <>
      <SuspendModal user={user} open={modal === "suspend"} onClose={onClose} />
      <UnsuspendModal
        user={user}
        open={modal === "unsuspend"}
        onClose={onClose}
      />
      <DeleteModal user={user} open={modal === "delete"} onClose={onClose} />
      <ChangePasswordModal
        user={user}
        open={modal === "changePassword"}
        onClose={onClose}
      />
    </>
  );
}
