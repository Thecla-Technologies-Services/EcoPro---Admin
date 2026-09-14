"use client";

import { useState } from "react";
import { ActionDialog } from "@/components/shared/action-dialog";
import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { FloatingSelect } from "@/components/shared/form/floating-select";
import { Textarea } from "@/components/ui/textarea";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useAssignableAdmins } from "@/hooks/admin/use-assignable-admins";
import { useUsers } from "@/hooks/admin/use-users";
import {
  TICKET_CATEGORY_OPTIONS,
  TICKET_FORM_STATUS_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_SOURCE_OPTIONS,
} from "@/constants/support-ticket";

/**
 * How long a description may run.
 *
 * The API has no documented limit — it has no create endpoint at all — so this
 * is the product's: long enough for an account of what happened, short enough
 * that the box stays a box and the ticket stays skimmable in the table.
 */
const DESCRIPTION_MAX = 500;

/** What the form holds. Everything is a string, including the two ids. */
interface ComplaintForm {
  userId: string;
  category: string;
  subject: string;
  description: string;
  source: string;
  priority: string;
  status: string;
  assigneeId: string;
}

const EMPTY: ComplaintForm = {
  userId: "",
  category: "",
  subject: "",
  description: "",
  source: "",
  priority: "",
  status: "Open",
  assigneeId: "",
};

/**
 * Files a complaint on a user's behalf — or would, if the API could take one.
 *
 * `/support/tickets` is read-only apart from `resolve`: the swagger documents
 * no endpoint that creates a ticket, and `SupportTicketDto` has no reporter,
 * subject, source, priority or assignee to carry these answers even if there
 * were one. So the form is here in full and submitting fails, saying why,
 * rather than closing on a confirmation for a complaint that reached nothing.
 * The body of `file` becomes the mutation call when the endpoint lands.
 */
export function FileComplaintDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState<ComplaintForm>(EMPTY);

  const set = <K extends keyof ComplaintForm>(key: K) =>
    (value: ComplaintForm[K]) =>
      setForm((current) => ({ ...current, [key]: value }));

  // Who the complaint is about: the platform's own users, staff excluded —
  // an admin account is not who a complaint is filed for.
  const users = useUsers(undefined, { excludeAdmins: true, pageSize: 100 });
  const userOptions = (users.data?.users?.data ?? []).map((user) => ({
    value: user.id ?? "",
    label: user.name ?? user.email ?? "Unnamed user",
  }));

  const admins = useAssignableAdmins();

  const file = useAsyncAction(async () => {
    throw new Error(
      "The Admin API lists and resolves tickets but has no endpoint that creates one, so this complaint cannot be filed yet.",
    );
  });

  function close() {
    file.reset();
    setForm(EMPTY);
    onOpenChange(false);
  }

  // Assignment is optional — a complaint can be filed into the queue for
  // whoever picks it up next.
  const complete = Boolean(
    form.userId &&
      form.category &&
      form.subject.trim() &&
      form.description.trim() &&
      form.source &&
      form.priority &&
      form.status,
  );

  return (
    <ActionDialog
      open={open}
      onOpenChange={(next) => !next && close()}
      // Tall rather than wide: one column of fields, and the dialog grows to
      // hold all eight. The cap and the column layout keep the buttons on
      // screen on a short viewport, where the fields scroll instead.
      className="flex max-h-[92vh] flex-col max-w-sm md:max-w-md"
    >
      <ActionDialog.Title>File a complaint</ActionDialog.Title>
      <ActionDialog.Description>
        Raise a ticket for an issue reported outside the app.
      </ActionDialog.Description>

      <div className="my-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <FloatingSelect
          label={users.isPending ? "Loading users…" : "User"}
          options={userOptions}
          value={form.userId}
          onChange={set("userId")}
          disabled={users.isPending || userOptions.length === 0}
        />

        <FloatingSelect
          label="Category"
          options={[...TICKET_CATEGORY_OPTIONS]}
          value={form.category}
          onChange={set("category")}
        />

        <FloatingLabelInput
          label="Subject"
          value={form.subject}
          onChange={(event) => set("subject")(event.target.value)}
        />

        <div>
          <Textarea
            placeholder="Description"
            aria-label="Description"
            value={form.description}
            maxLength={DESCRIPTION_MAX}
            onChange={(event) =>
              // Sliced as well as capped: `maxLength` does not apply to a
              // pasted value in every browser.
              set("description")(event.target.value.slice(0, DESCRIPTION_MAX))
            }
            className="h-20 resize-none text-sm"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {form.description.length}/{DESCRIPTION_MAX}
          </p>
        </div>

        <FloatingSelect
          label="Source"
          options={[...TICKET_SOURCE_OPTIONS]}
          value={form.source}
          onChange={set("source")}
        />

        <FloatingSelect
          label="Priority"
          options={[...TICKET_PRIORITY_OPTIONS]}
          value={form.priority}
          onChange={set("priority")}
        />

        <FloatingSelect
          label="Status"
          options={[...TICKET_FORM_STATUS_OPTIONS]}
          value={form.status}
          onChange={set("status")}
        />

        <FloatingSelect
          label={admins.isPending ? "Loading admins…" : "Assign to (optional)"}
          options={admins.options}
          value={form.assigneeId}
          onChange={set("assigneeId")}
          disabled={admins.isPending || admins.options.length === 0}
        />
      </div>

      <ActionDialog.Error error={file.error} />

      <ActionDialog.Actions>
        <ActionDialog.Cancel onClick={close} disabled={file.isLoading} />
        <ActionDialog.Confirm
          onClick={() => file.run()}
          isLoading={file.isLoading}
          disabled={!complete}
        >
          File Complaint
        </ActionDialog.Confirm>
      </ActionDialog.Actions>
    </ActionDialog>
  );
}
