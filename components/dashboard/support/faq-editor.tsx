"use client";

import { useState } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import {
  useCreateFaqArticle,
  useDeleteFaqArticle,
  useUpdateFaqArticle,
} from "@/hooks/admin/use-support";
import { toErrorMessage } from "@/lib/api/errors";
import { faqArticleSchema, type FaqArticleForm } from "@/lib/validations/support";

const DEFAULT_VALUES: FaqArticleForm = {
  articleId: "",
  category: "",
  question: "",
  answer: "",
  sortOrder: 0,
};

/**
 * Writes FAQ articles.
 *
 * Deliberately a form rather than a table: the admin API creates, updates and
 * deletes FAQ articles but has no endpoint that reads them back, so there is no
 * list to render and an edit has to be addressed by id. The note on screen says
 * so — an empty table would read as "there are no articles", which is a claim
 * this dashboard cannot make.
 */
export function FaqEditor() {
  const [saved, setSaved] = useState<"created" | "updated" | "deleted" | null>(
    null,
  );

  const create = useCreateFaqArticle();
  const update = useUpdateFaqArticle();
  const remove = useDeleteFaqArticle();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FaqArticleForm>({
    resolver: zodResolver(faqArticleSchema) as Resolver<FaqArticleForm>,
    defaultValues: DEFAULT_VALUES,
  });

  const articleId = useWatch({ control, name: "articleId" })?.trim();
  const isUpdate = Boolean(articleId);

  const error = create.error ?? update.error ?? remove.error;
  const isBusy = create.isPending || update.isPending || remove.isPending;

  async function onSubmit({ articleId: id, ...body }: FaqArticleForm) {
    const trimmed = id?.trim();

    if (trimmed) {
      await update.mutateAsync({ articleId: trimmed, ...body });
      setSaved("updated");
      return;
    }

    await create.mutateAsync(body);
    setSaved("created");
    // A created article has no id to edit by, so the form clears for the next
    // one rather than looking like it is still holding the saved one.
    reset(DEFAULT_VALUES);
  }

  async function onDelete() {
    if (!articleId) return;
    await remove.mutateAsync(articleId);
    setSaved("deleted");
    reset(DEFAULT_VALUES);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-lg bg-muted/40 p-4 md:rounded-2xl md:p-6"
    >
      <div>
        <h2 className="text-lg font-semibold">FAQ Articles</h2>
        <p className="text-sm text-muted-foreground">
          Publish and maintain the help-centre answers
        </p>
      </div>

      <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        The admin API writes FAQ articles but does not read them back — there is
        no endpoint that lists them. Leave the ID blank to publish a new
        article, or paste an existing article&apos;s ID to change or remove it.
      </p>

      <div className="space-y-5 rounded-lg bg-background p-4">
        <div className="grid gap-2">
          <Label htmlFor="faq-id">Article ID (leave blank to create)</Label>
          <Controller
            control={control}
            name="articleId"
            render={({ field }) => (
              <Input
                id="faq-id"
                placeholder="e.g. 3f1c…"
                {...field}
                value={field.value ?? ""}
              />
            )}
          />
        </div>

        <div className="grid gap-2 md:grid-cols-[1fr_8rem] md:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="faq-category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Input
                  id="faq-category"
                  placeholder="e.g. Payments"
                  {...field}
                />
              )}
            />
            {errors.category && (
              <p className="text-xs text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="faq-order">Sort order</Label>
            <Controller
              control={control}
              name="sortOrder"
              render={({ field }) => (
                <Input id="faq-order" type="number" min={0} {...field} />
              )}
            />
            {errors.sortOrder && (
              <p className="text-xs text-destructive">
                {errors.sortOrder.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="faq-question">Question</Label>
          <Controller
            control={control}
            name="question"
            render={({ field }) => (
              <Input
                id="faq-question"
                placeholder="How do I withdraw my balance?"
                {...field}
              />
            )}
          />
          {errors.question && (
            <p className="text-xs text-destructive">
              {errors.question.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="faq-answer">Answer</Label>
          <Controller
            control={control}
            name="answer"
            render={({ field }) => (
              <Textarea
                id="faq-answer"
                className="h-32 resize-none"
                placeholder="Explain the steps…"
                {...field}
              />
            )}
          />
          {errors.answer && (
            <p className="text-xs text-destructive">{errors.answer.message}</p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-xs text-destructive">
            {toErrorMessage(error)}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            isLoading={create.isPending || update.isPending}
            disabled={isBusy}
            className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
          >
            {isUpdate ? "Save Changes" : "Publish Article"}
          </Button>

          {/* Only offered once an id names something to delete. */}
          {isUpdate && (
            <Button
              type="button"
              variant="outline"
              isLoading={remove.isPending}
              disabled={isBusy}
              onClick={onDelete}
              className="rounded-full border-destructive px-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Delete Article
            </Button>
          )}
        </div>
      </div>

      <ConfirmActionDialog
        open={saved !== null}
        onOpenChange={(next) => !next && setSaved(null)}
        title={
          saved === "deleted"
            ? "Article Deleted"
            : saved === "updated"
              ? "Article Updated"
              : "Article Published"
        }
        description={
          saved === "deleted"
            ? "The article has been removed from the help centre."
            : "The help centre has been updated."
        }
      >
        <Button
          className="w-full rounded-full bg-primary text-primary-foreground"
          onClick={() => setSaved(null)}
        >
          Done
        </Button>
      </ConfirmActionDialog>
    </form>
  );
}
