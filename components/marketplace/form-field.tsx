import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

/** Shared by every useActionState-driven form (asset-form.tsx,
 * buyer-profile-form.tsx) for a consistent label + control + inline
 * field-error layout. */
export function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string[];
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error[0]}</p>}
    </div>
  );
}
