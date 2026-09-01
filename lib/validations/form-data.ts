/**
 * Shared by every `*FormDataToInput()` parser in lib/validations/ — turns a
 * blank/absent field into `undefined` so an optional field is treated as
 * "not provided" instead of, e.g., an optional numeric field coercing ""
 * to 0.
 */
export function blankToUndefined(value: FormDataEntryValue | null): string | undefined {
  if (value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
}
