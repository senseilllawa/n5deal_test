import { z } from "zod";

export const sendContactRequestSchema = z.object({
  message: z.string().trim().min(10, "Say a bit more — at least 10 characters").max(2000),
  // Empty string from the "no asset" <select> option means "not attached".
  assetId: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
});

export type SendContactRequestInput = z.infer<typeof sendContactRequestSchema>;

export function contactFormDataToInput(formData: FormData): Record<string, unknown> {
  return {
    message: formData.get("message") ?? undefined,
    assetId: formData.get("assetId") ?? undefined,
  };
}
