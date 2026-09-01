"use client";

import { useActionState, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Sectors of interest</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {SECTORS.map((sector) => (
            <label key={sector} className="flex items-center gap-2 text-sm">
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
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {JURISDICTIONS.map((j) => (
            <label key={j.code} className="flex items-center gap-2 text-sm">
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

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Deal types</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {DEAL_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm capitalize">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="budgetMin" label="Min budget, EUR (optional)" error={errors.budgetMin}>
          <Input id="budgetMin" name="budgetMin" type="number" min={0} defaultValue={initial?.budgetMin ?? ""} />
        </FormField>
        <FormField id="budgetMax" label="Max budget, EUR (optional)" error={errors.budgetMax}>
          <Input id="budgetMax" name="budgetMax" type="number" min={0} defaultValue={initial?.budgetMax ?? ""} />
        </FormField>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Saving…" : "Save profile"}
        </Button>
        {state?.ok && <p className="text-sm text-muted-foreground">Saved.</p>}
      </div>
    </form>
  );
}
