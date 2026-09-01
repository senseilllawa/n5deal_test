"use client";

import { useActionState, useState, type FormEvent, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/marketplace/form-field";
import { CURRENCIES, JURISDICTIONS, SECTORS } from "@/lib/taxonomy";
import { assetFormDataToInput, createAssetSchema } from "@/lib/validations/asset";
import { z } from "zod";
import { createAsset, type CreateAssetState } from "./actions";

export function AssetForm() {
  const [state, formAction, pending] = useActionState<CreateAssetState, FormData>(createAsset, null);
  // A client-side re-check with the same schema (see lib/validations/asset.ts)
  // catches obvious mistakes instantly, without waiting on a round trip —
  // the server re-validates regardless, since it's the only trustworthy copy.
  const [clientErrors, setClientErrors] = useState<Partial<Record<string, string[]>> | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [itemDraft, setItemDraft] = useState("");

  const errors = clientErrors ?? state?.fieldErrors ?? {};

  function addItem() {
    const value = itemDraft.trim();
    if (value && !items.includes(value) && items.length < 20) {
      setItems([...items, value]);
    }
    setItemDraft("");
  }

  function handleItemKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const parsed = createAssetSchema.safeParse(assetFormDataToInput(formData));
    if (!parsed.success) {
      e.preventDefault();
      setClientErrors(z.flattenError(parsed.error).fieldErrors);
    } else {
      setClientErrors(null);
    }
  }

  return (
    // noValidate: the HTML `required`/min/max attributes below stay for
    // semantics and autofill, but without this the browser's own validation
    // UI would intercept a first empty submit before handleSubmit ever ran,
    // pre-empting our inline zod error messages.
    <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="title" label="Title" error={errors.title}>
        <Input id="title" name="title" required minLength={3} maxLength={200} />
      </FormField>

      <FormField id="description" label="Description" error={errors.description}>
        <Textarea id="description" name="description" rows={5} required minLength={20} maxLength={5000} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="sector" label="Sector" error={errors.sector}>
          <Select name="sector" defaultValue={SECTORS[0]}>
            <SelectTrigger id="sector" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="jurisdiction" label="Jurisdiction" error={errors.jurisdiction}>
          <Select name="jurisdiction" defaultValue={JURISDICTIONS[0].code}>
            <SelectTrigger id="jurisdiction" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JURISDICTIONS.map((j) => (
                <SelectItem key={j.code} value={j.code}>
                  {j.label} ({j.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField id="licenseType" label="License type" error={errors.licenseType}>
        <Input
          id="licenseType"
          name="licenseType"
          required
          maxLength={200}
          placeholder="e.g. EMI License (Art. 11 EMD2)"
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="price" label="Price" error={errors.price}>
          <div className="flex gap-2">
            <Input id="price" name="price" type="number" min={1} step={1} required className="flex-1" />
            <Select name="currency" defaultValue="EUR">
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FormField>

        <FormField id="yearIssued" label="Year issued (optional)" error={errors.yearIssued}>
          <Input id="yearIssued" name="yearIssued" type="number" min={1900} max={new Date().getFullYear()} />
        </FormField>
      </div>

      <FormField id="employeeCount" label="Employee count (optional)" error={errors.employeeCount}>
        <Input id="employeeCount" name="employeeCount" type="number" min={0} className="sm:w-40" />
      </FormField>

      <FormField id="itemDraft" label="Included items (optional)" error={errors.includedItems}>
        <div className="flex gap-2">
          <Input
            id="itemDraft"
            value={itemDraft}
            onChange={(e) => setItemDraft(e.target.value)}
            onKeyDown={handleItemKeyDown}
            placeholder="e.g. Bank account — press Enter to add"
          />
          <Button type="button" variant="outline" onClick={addItem}>
            Add
          </Button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {items.map((item) => (
              <Badge key={item} variant="secondary" className="gap-1">
                {item}
                <input type="hidden" name="includedItems" value={item} />
                <button
                  type="button"
                  onClick={() => setItems(items.filter((i) => i !== item))}
                  aria-label={`Remove ${item}`}
                  className="ml-0.5 cursor-pointer"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </FormField>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Publishing…" : "Publish asset"}
      </Button>
    </form>
  );
}
