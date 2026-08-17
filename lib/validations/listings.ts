import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  condition: z.string().min(1, "Condition is required"),
  // Optional: the Admin API's create endpoint accepts neither, so these are
  // collected but not sent. Requiring them would block a valid submission.
  brand: z.string().optional(),
  size: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  price: z.number().min(1, "Price is required"),
})