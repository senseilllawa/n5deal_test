"use client";

import { useActionState, useState } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/marketplace/form-field";
import type { ModerationState } from "@/lib/actions/moderation";
import type { VariantProps } from "class-variance-authority";

/**
 * Shared by every Suspend/Remove confirmation in /manager/users and
 * /manager/assets — same Dialog + reason-textarea + useActionState shape
 * as the contact-request dialogs, parameterized by which action to bind
 * and whether a reason is mandatory (Suspend) or just nice-to-have
 * (Remove). Reactivate/Restore don't use this at all — see
 * lib/actions/moderation.ts's doc comments on why those skip the dialog.
 */
export function ModerationDialog({
  targetId,
  action,
  triggerLabel,
  triggerVariant = "destructive",
  title,
  description,
  reasonRequired,
}: {
  targetId: string;
  action: (targetId: string, prevState: ModerationState, formData: FormData) => Promise<ModerationState>;
  triggerLabel: string;
  triggerVariant?: VariantProps<typeof buttonVariants>["variant"];
  title: string;
  description: string;
  reasonRequired: boolean;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = action.bind(null, targetId);
  const [state, formAction, pending] = useActionState<ModerationState, FormData>(boundAction, null);

  // Adjusting state during render, not useEffect+setState — see CLAUDE.md Gotchas.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) setOpen(false);
  }

  const fieldErrors = state && !state.ok ? state.fieldErrors : {};
  const formError = state && !state.ok ? state.formError : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={triggerVariant} size="sm" />}>{triggerLabel}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          <FormField id="reason" label={reasonRequired ? "Reason" : "Reason (optional)"} error={fieldErrors.reason}>
            <Textarea id="reason" name="reason" rows={3} required={reasonRequired} minLength={reasonRequired ? 5 : undefined} />
          </FormField>
          {formError && <p className="text-xs text-destructive">{formError}</p>}
          <DialogFooter>
            <Button type="submit" variant={triggerVariant} disabled={pending}>
              {pending ? "Working…" : triggerLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
