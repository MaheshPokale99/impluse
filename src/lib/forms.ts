import * as z from "zod";

export type FieldType =
    "text" | "email" | "tel" | "password" | "textarea" | "number" | "date" | "select";

export type FieldOption = string | { value: string; label: string };

export type FormFieldDef = {
    name: string;
    label: string;
    type: FieldType;
    options?: readonly FieldOption[];
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    hint?: string;
    placeholder?: string;
    autoComplete?: string;
    wide?: boolean;
};

export type FormSection = { title?: string; fields: readonly FormFieldDef[] };

export type ActionState = {
    status?: "success" | "error";
    message?: string;
    errors?: Record<string, string[] | undefined>;
    values?: Record<string, string>;
};

export const optionValue = (option: FieldOption) =>
    typeof option === "string" ? option : option.value;
export const optionLabel = (option: FieldOption) =>
    typeof option === "string" ? option : option.label;

const shortLabel = (field: FormFieldDef) => field.label.replace(/\s*%$/, "").toLowerCase();

/** Placeholder inside an empty input, e.g. "name@example.com", "Select batch", "0–100". */
export function placeholderFor(field: FormFieldDef) {
    if (field.placeholder) return field.placeholder;
    switch (field.type) {
        case "email":
            return "name@example.com";
        case "select":
            return `Select ${shortLabel(field)}`;
        case "date":
            return "Pick a date";
        case "textarea":
            return `Add ${shortLabel(field)}`;
        case "number":
            return field.min !== undefined && field.max !== undefined
                ? `${field.min}–${field.max}`
                : "0";
        default:
            return `Enter ${shortLabel(field)}`;
    }
}

export function emptyHintFor(field: FormFieldDef, compact: boolean) {
    if (field.type === "select") return compact ? "Select" : `Select ${shortLabel(field)}`;
    if (field.type === "date") return compact ? "Pick date" : "Pick a date";
    return compact ? "Add" : `Add ${shortLabel(field)}`;
}

export const isUuid = (value: unknown): value is string => z.uuid().safeParse(value).success;

const emptyToNull = (value: unknown) =>
    value === null || (typeof value === "string" && value.trim() === "") ? null : value;

function valueSchema(field: FormFieldDef): z.ZodType {
    const required = { error: `${field.label} is required.` };
    switch (field.type) {
        case "email":
            return z
                .string(required)
                .trim()
                .toLowerCase()
                .pipe(z.email({ error: "Enter a valid email address." }));
        case "password":
            return z
                .string(required)
                .min(field.min ?? 1, {
                    error: `${field.label} must be at least ${field.min ?? 1} characters.`,
                })
                .max(128);
        case "tel":
            return z
                .string(required)
                .trim()
                .regex(/^\+?[\d\s-]{7,20}$/, { error: "Enter a valid phone number." });
        case "number": {
            let schema = z.coerce.number({ error: `${field.label} must be a number.` });
            if (field.min !== undefined) {
                schema = schema.min(field.min, {
                    error: `${field.label} must be at least ${field.min}.`,
                });
            }
            if (field.max !== undefined) {
                schema = schema.max(field.max, {
                    error: `${field.label} must be at most ${field.max}.`,
                });
            }
            return field.step && !Number.isInteger(field.step)
                ? schema
                : schema.int({ error: `${field.label} must be a whole number.` });
        }
        case "date":
            return z.iso.date({ error: `${field.label} must be a valid date.` });
        case "select":
            return z.enum((field.options ?? []).map(optionValue), {
                error: `Choose a valid ${field.label.toLowerCase()}.`,
            });
        default:
            return z
                .string(required)
                .trim()
                .min(1, required)
                .max(field.max ?? (field.type === "textarea" ? 5000 : 200));
    }
}

/** Builds a Zod schema from field definitions. Empty optional fields become `null`. */
export function schemaFor(fields: readonly FormFieldDef[]) {
    return z.object(
        Object.fromEntries(
            fields.map((field) => {
                const schema = valueSchema(field);
                return [
                    field.name,
                    field.required
                        ? z.preprocess((value) => emptyToNull(value) ?? undefined, schema)
                        : z.preprocess(emptyToNull, schema.nullable()),
                ];
            }),
        ),
    );
}

/**
 * Validates form data against field definitions. On failure, returns an error state that
 * echoes the submitted values (never passwords) so the form keeps what the user typed.
 */
export function parseForm<T>(
    fields: readonly FormFieldDef[],
    formData: FormData,
): { data: T; state?: never } | { data?: never; state: ActionState } {
    const raw = Object.fromEntries(fields.map((field) => [field.name, formData.get(field.name)]));
    const result = schemaFor(fields).safeParse(raw);
    if (result.success) return { data: result.data as T };
    return {
        state: errorState(
            "Please fix the highlighted fields.",
            z.flattenError(result.error).fieldErrors,
            echoValues(fields, formData),
        ),
    };
}

/** Validates one value, e.g. from an inline table edit. */
export function parseValue(
    field: FormFieldDef,
    raw: string,
): { ok: true; value: unknown } | { ok: false; error: string } {
    const result = schemaFor([field]).safeParse({ [field.name]: raw });
    if (result.success) return { ok: true, value: result.data[field.name] };
    const [error] = z.flattenError(result.error).fieldErrors[field.name] ?? [];
    return { ok: false, error: error ?? `Enter a valid ${field.label.toLowerCase()}.` };
}

export function errorState(
    message: string,
    errors?: ActionState["errors"],
    values?: ActionState["values"],
): ActionState {
    return { status: "error", message, errors, values };
}

export function echoValues(fields: readonly FormFieldDef[], formData: FormData) {
    return Object.fromEntries(
        fields
            .filter((field) => field.type !== "password")
            .map((field) => [field.name, String(formData.get(field.name) ?? "")]),
    );
}

/** Converts a database row into string default values for form inputs. */
export function toFormValues(record: object): Record<string, string> {
    return Object.fromEntries(
        Object.entries(record).map(([key, value]) => [key, value == null ? "" : String(value)]),
    );
}
