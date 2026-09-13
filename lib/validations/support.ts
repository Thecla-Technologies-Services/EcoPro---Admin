import { z } from "zod";

/**
 * The body `POST /support/faq` and `PUT /support/faq/{articleId}` both take.
 *
 * `articleId` is part of the form rather than a route the admin arrived on:
 * there is no endpoint that lists FAQ articles, so editing or deleting one
 * means naming its id.
 */
export const faqArticleSchema = z.object({
  articleId: z.string().optional(),
  category: z.string().min(2, "Enter a category"),
  question: z.string().min(5, "Enter the question"),
  answer: z.string().min(5, "Enter the answer"),
  sortOrder: z.coerce.number().int().min(0, "Must be 0 or more"),
});

export type FaqArticleForm = z.infer<typeof faqArticleSchema>;
