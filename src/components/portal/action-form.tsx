"use client";

import { useActionState, useEffect, useEffectEvent, useId, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { placeholderFor, type ActionState, type FormFieldDef, type FormSection } from "@/lib/forms";
import { DatePicker } from "./date-picker";
import { FormSelect } from "./option-select";
import { PasswordInput } from "./password-input";

export function FormField({
    field,
    defaultValue,
    errors,
    idPrefix,
}: {
    field: FormFieldDef;
    defaultValue?: string;
    errors?: string[];
    idPrefix: string;
}) {
    const id = `${idPrefix}${field.name}`;
    const invalid = Boolean(errors?.length);
    const describedBy =
        [field.hint && `${id}-hint`, invalid && `${id}-error`].filter(Boolean).join(" ") ||
        undefined;
    const common = {
        id,
        name: field.name,
        defaultValue,
        required: field.required,
        "aria-invalid": invalid || undefined,
        "aria-describedby": describedBy,
    };

    const picker = {
        id,
        name: field.name,
        defaultValue,
        required: field.required,
        invalid,
        describedBy,
    };

    const placeholder = placeholderFor(field);
    let control: ReactNode;
    if (field.type === "textarea") {
        control = <Textarea rows={4} maxLength={field.max} placeholder={placeholder} {...common} />;
    } else if (field.type === "select") {
        // Keyed by the default so an echoed value after a failed submit is shown again.
        control = (
            <FormSelect
                key={defaultValue}
                options={field.options ?? []}
                placeholder={placeholder}
                {...picker}
            />
        );
    } else if (field.type === "date") {
        control = <DatePicker key={defaultValue} {...picker} />;
    } else if (field.type === "password") {
        control = (
            <PasswordInput
                minLength={field.min}
                maxLength={field.max}
                placeholder={placeholder}
                autoComplete={field.autoComplete}
                {...common}
            />
        );
    } else {
        control = (
            <Input
                type={field.type}
                min={field.type === "number" ? field.min : undefined}
                max={field.type === "number" ? field.max : undefined}
                step={field.type === "number" ? (field.step ?? 1) : undefined}
                maxLength={field.type === "number" ? undefined : field.max}
                placeholder={placeholder}
                autoComplete={field.autoComplete}
                {...common}
            />
        );
    }

    return (
        <Field data-invalid={invalid || undefined} className={cn(field.wide && "sm:col-span-full")}>
            <FieldLabel htmlFor={id}>
                {field.label}
                {field.required && (
                    <span aria-hidden className="text-muted-foreground">
                        *
                    </span>
                )}
            </FieldLabel>
            {control}
            {field.hint && <FieldDescription id={`${id}-hint`}>{field.hint}</FieldDescription>}
            {invalid && <FieldError id={`${id}-error`}>{errors?.join(" ")}</FieldError>}
        </Field>
    );
}

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export type ActionFormProps = {
    action: FormAction;
    fields?: readonly FormFieldDef[];
    sections?: readonly FormSection[];
    values?: Record<string, string>;
    submitLabel: string;
    columns?: 1 | 2;
    onSuccess?: (state: ActionState) => void;
    children?: ReactNode;
};

export function ActionForm({
    action,
    fields,
    sections,
    values,
    submitLabel,
    columns = 1,
    onSuccess,
    children,
}: ActionFormProps) {
    const [state, formAction, pending] = useActionState(action, {});
    const idPrefix = useId();
    const groups = sections ?? [{ fields: fields ?? [] }];
    const notifySuccess = useEffectEvent((result: ActionState) => onSuccess?.(result));

    useEffect(() => {
        if (state.status === "success") notifySuccess(state);
    }, [state]);

    const showMessage = state.message && !(state.status === "success" && onSuccess);

    return (
        <form action={formAction} className="flex flex-col gap-6">
            {groups.map((group, index) => (
                <FieldSet key={group.title ?? index}>
                    {group.title && <FieldLegend variant="label">{group.title}</FieldLegend>}
                    <FieldGroup className={cn("grid gap-4", columns === 2 && "sm:grid-cols-2")}>
                        {group.fields.map((field) => (
                            <FormField
                                key={field.name}
                                field={field}
                                idPrefix={idPrefix}
                                defaultValue={state.values?.[field.name] ?? values?.[field.name]}
                                errors={state.errors?.[field.name]}
                            />
                        ))}
                    </FieldGroup>
                </FieldSet>
            ))}
            {showMessage && (
                <p
                    role="status"
                    className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        state.status === "success"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive",
                    )}
                >
                    {state.message}
                </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button type="submit" disabled={pending}>
                    {pending && <Loader2 className="animate-spin" />}
                    {submitLabel}
                </Button>
                {children}
            </div>
        </form>
    );
}
