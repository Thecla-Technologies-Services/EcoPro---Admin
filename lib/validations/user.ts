import { z } from "zod";

const contactDetailsShape = {
  profileImage: z.any().optional().nullable(),
  contactPersonName: z.string().min(2, "Enter the contact person's name"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[0-9]{10,14}$/, "Enter a valid phone number"),
  businessName: z.string().min(2, "Enter a business name"),
  utrNumber: z.string().min(3, "Enter a UTR number"),
};

const documentsShape = {
  registrationNumber: z.string().min(3, "Enter the CAC registration number"),
  documents: z.array(z.instanceof(File)),
  existingDocuments: z.array(
    z.object({ id: z.string(), name: z.string(), url: z.string() }),
  ),
  bankName: z.string().min(1, "Select a bank"),
  bankAccountNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "Account number must be 10 digits"),
  accountHolderName: z.string().optional(),
};

const locationShape = {
  country: z.string().min(1, "Select a country"),
  state: z.string().optional(),
  lga: z.string().optional(),
  region: z.string().optional(),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  verifyEmailAutomatically: z.boolean().default(true),
};

export const contactDetailsSchema = z.object(contactDetailsShape);
export const documentsSchema = z.object(documentsShape);
export const locationSchema = z.object(locationShape);

export const deliveryPartnerFormSchema = z
  .object({
    ...contactDetailsShape,
    ...documentsShape,
    ...locationShape,
  })
  .superRefine((values, ctx) => {
    if (
      values.documents.length === 0 &&
      values.existingDocuments.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Upload at least one verification document",
        path: ["documents"],
      });
    }

    if (values.country === "Nigeria") {
      if (!values.state) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a state",
          path: ["state"],
        });
      }
      if (!values.lga) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select an LGA",
          path: ["lga"],
        });
      }
    } else if (!values.region) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a region",
        path: ["region"],
      });
    }
  });

const contactNGODetailsShape = {
  profileImage: z.any().optional().nullable(),
  organisationName: z.string().min(2, "Enter the organisation name"),
  contactPersonName: z.string().min(2, "Enter the contact person's name"),
  contactEmail: z
    .string()
    .min(1, "Email address is required")
    .email("Enter a valid email address"),
  contactPhone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[0-9]{10,14}$/, "Enter a valid phone number"),
};

// An NGO's second step asks for the organisation's address and its
// verification documents — not the bank and CAC fields a delivery partner
// needs — so it has its own shape rather than reusing `documentsShape`.
const ngoDocumentsShape = {
  organizationAddress: z.string().min(2, "Enter the organisation's address"),
  postalCode: z.string().min(3, "Enter the postal code"),
  documents: z.array(z.instanceof(File)),
  existingDocuments: z.array(
    z.object({ id: z.string(), name: z.string(), url: z.string() }),
  ),
};

export const contactNGODetailsSchema = z.object(contactNGODetailsShape);
export const ngoDocumentsSchema = z.object(ngoDocumentsShape);

export const ngoFormSchema = z
  .object({
    ...contactNGODetailsShape,
    ...ngoDocumentsShape,
  })
  .superRefine((values, ctx) => {
    if (
      values.documents.length === 0 &&
      values.existingDocuments.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Upload at least one verification document",
        path: ["documents"],
      });
    }
  });

export type ContactNGODetailsValues = z.infer<typeof contactNGODetailsSchema>;
export type NgoFormSchema = z.infer<typeof ngoFormSchema>;

export type ContactDetailsValues = z.infer<typeof contactDetailsSchema>;
export type DocumentsValues = z.infer<typeof documentsSchema>;
export type LocationValues = z.infer<typeof locationSchema>;
export type DeliveryPartnerFormSchema = z.infer<
  typeof deliveryPartnerFormSchema
>;
