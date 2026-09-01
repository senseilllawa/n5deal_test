"use client";

import { useActionState, useState, type FormEvent } from "react";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/marketplace/form-field";
import { DEAL_TYPES, JURISDICTIONS, SECTORS } from "@/lib/taxonomy";
import { buyerProfileFormDataToInput, upsertBuyerProfileSchema } from "@/lib/validations/buyer-profile";
import { upsertBuyerProfile, type UpsertBuyerProfileState } from "./actions";

export interface BuyerProfileFormData {
  headline: string | null;
  bio: string | null;
  sectors: string[];
  jurisdictions: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  dealTypes: string[];
}

// One class string for every checkbox "pill" below (sectors, jurisdictions,
// deal types): the checkbox itself stays real and visible — sized small and
// tinted via the global `accent-color` rule (see globals.css) — so its own
// checkmark glyph is the non-color "selected" signal accessibility asked
// for, and the enclosing label's border/background is the second, purely
// decorative one on top of it.
const PILL_LABEL_CLASS =
  "flex cursor-pointer items-center gap-2 rounded-full border border-border bg-transparent px-3 py-1.5 text-sm text-muted-foreground transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-foreground hover:border-foreground/30";

export function BuyerProfileForm({ initial }: { initial: BuyerProfileFormData | null }) {
  const [state, formAction, pending] = useActionState<UpsertBuyerProfileState, FormData>(upsertBuyerProfile, null);
  // Same client-side re-check pattern as asset-form.tsx, same schema module
  // reused for both — see lib/validations/buyer-profile.ts.
  const [clientErrors, setClientErrors] = useState<Partial<Record<string, string[]>> | null>(null);

  const errors = clientErrors ?? (state && !state.ok ? state.fieldErrors : {});

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const parsed = upsertBuyerProfileSchema.safeParse(buyerProfileFormDataToInput(formData));
    if (!parsed.success) {
      e.preventDefault();
      setClientErrors(z.flattenError(parsed.error).fieldErrors);
    } else {
      setClientErrors(null);
    }
  }

  return (
    // noValidate — see asset-form.tsx: without it, an empty/invalid submit
    // never reaches handleSubmit, since the browser's own validation UI
    // intercepts it first.
    <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile basics</CardTitle>
          <CardDescription>A short headline and bio help Sellers quickly understand what you&apos;re looking for.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormField id="headline" label="Headline (optional)" error={errors.headline}>
            <Input
              id="headline"
              name="headline"
              maxLength={200}
              defaultValue={initial?.headline ?? ""}
              placeholder="e.g. Search fund targeting licensed EMIs in the Baltics"
            />
          </FormField>

          <FormField id="bio" label="Bio (optional)" error={errors.bio}>
            <Textarea id="bio" name="bio" rows={4} maxLength={2000} defaultValue={initial?.bio ?? ""} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Areas of interest</CardTitle>
          <CardDescription>Pick every sector and jurisdiction you&apos;d consider — Sellers and matching both use these.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Sectors of interest</legend>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((sector) => (
                <label key={sector} className={PILL_LABEL_CLASS}>
                  <input
                    type="checkbox"
                    name="sectors"
                    value={sector}
                    defaultChecked={initial?.sectors.includes(sector)}
                  />
                  {sector}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Jurisdictions of interest</legend>
            <div className="flex flex-wrap gap-2">
              {JURISDICTIONS.map((j) => (
                <label key={j.code} className={PILL_LABEL_CLASS}>
                  <input
                    type="checkbox"
                    name="jurisdictions"
                    value={j.code}
                    defaultChecked={initial?.jurisdictions.includes(j.code)}
                  />
                  {j.label} ({j.code})
                </label>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deal preferences</CardTitle>
          <CardDescription>What kind of deal structures are you open to?</CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Deal types</legend>
            <div className="flex flex-wrap gap-2">
              {DEAL_TYPES.map((type) => (
                <label key={type} className={`${PILL_LABEL_CLASS} capitalize`}>
                  <input
                    type="checkbox"
                    name="dealTypes"
                    value={type}
                    defaultChecked={initial?.dealTypes.includes(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget</CardTitle>
          <CardDescription>Optional, but a defined range sharpens your match score against every listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="budgetMin" label="Min budget, EUR (optional)" error={errors.budgetMin}>
              <Input id="budgetMin" name="budgetMin" type="number" min={0} defaultValue={initial?.budgetMin ?? ""} />
            </FormField>
            <FormField id="budgetMax" label="Max budget, EUR (optional)" error={errors.budgetMax}>
              <Input id="budgetMax" name="budgetMax" type="number" min={0} defaultValue={initial?.budgetMax ?? ""} />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Saving…" : "Save profile"}
        </Button>
        {state?.ok && (
          <p className="flex items-center gap-1.5 text-sm text-status-active">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Saved.
          </p>
        )}
      </div>
    </form>
  );
}
