"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { sendContactRequest, type SendContactState } from "@/lib/actions/contact-request";

export function ContactBuyerDialog({
  buyerId,
  buyerName,
  myAssets,
}: {
  buyerId: string;
  buyerName: string;
  myAssets: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const boundAction = sendContactRequest.bind(null, buyerId);
  const [state, formAction, pending] = useActionState<SendContactState, FormData>(boundAction, null);

  // Close on success instead of leaving a "Send" button with nothing left to
  // do — the fresh request shows up next time they open /seller/inbox.
  // Adjusting state during render (React's documented pattern for "state
  // changed, react to it now") instead of a useEffect+setState, which would
  // cause an extra, avoidable re-render pass.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) setOpen(false);
  }

  const fieldErrors = state && !state.ok ? state.fieldErrors : {};
  const formError = state && !state.ok ? state.formError : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Contact is a primary action (same accent as Publish/Save elsewhere —
          see globals.css's --primary comment), not a secondary/outline one:
          it needs to read as clickable against a dark card, not blend into it. */}
      <DialogTrigger render={<Button size="sm" />}>Contact</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact {buyerName}</DialogTitle>
          <DialogDescription>They&apos;ll see this in their inbox — no reply happens here.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          {myAssets.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assetId">Attach one of your assets (optional)</Label>
              <Select name="assetId" defaultValue="">
                <SelectTrigger id="assetId" className="w-full">
                  <SelectValue placeholder="No asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No asset</SelectItem>
                  {myAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={4} required minLength={10} />
            {fieldErrors.message && <p className="text-xs text-destructive">{fieldErrors.message[0]}</p>}
          </div>
          {formError && <p className="text-xs text-destructive">{formError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
