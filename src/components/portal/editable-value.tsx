"use client";

import {
    useEffect,
    useRef,
    useState,
    type ComponentProps,
    type KeyboardEvent,
    type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    emptyHintFor,
    optionLabel,
    optionValue,
    placeholderFor,
    type FormFieldDef,
} from "@/lib/forms";
import { DateCalendar } from "./date-picker";
import { DisplayValue, displayText, ValueBadge } from "./values";

type Variant = "cell" | "property";

// Radix Select can't use "" as an item value, so clearing uses a sentinel.
const CLEAR = "__clear__";

const shells: Record<Variant, string> = {
    cell: "flex h-full min-h-9 w-full items-center px-3 text-left text-sm",
    property: "flex min-h-8 w-full items-center rounded-md px-2 text-left text-sm",
};
const triggerShells: Record<Variant, string> = {
    cell: "h-full min-h-9 w-full justify-start rounded-none px-3 font-normal focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-inset active:not-aria-[haspopup]:translate-y-0",
    property:
        "h-auto min-h-8 w-full justify-start rounded-md px-2 font-normal active:not-aria-[haspopup]:translate-y-0",
};

/** The clickable face of an editable value. `data-cell` lets a grid move focus with arrow keys. */
function Trigger({
    layout,
    className,
    ...props
}: Omit<ComponentProps<typeof Button>, "variant"> & { layout: Variant }) {
    return (
        <Button
            variant="ghost"
            data-cell=""
            className={cn(triggerShells[layout], "data-[state=open]:bg-muted", className)}
            {...props}
        />
    );
}

type EditorProps = {
    field: FormFieldDef;
    current: string;
    hint: string;
    onSave: (value: string) => void;
    variant: Variant;
    label: string;
    content: ReactNode;
};

export function EditableValue({
    field,
    value,
    editable,
    onSave,
    variant = "cell",
}: {
    field: FormFieldDef;
    value: unknown;
    editable: boolean;
    onSave: (value: string) => void;
    variant?: Variant;
}) {
    const current = value == null ? "" : String(value);
    const hint = editable ? emptyHintFor(field, variant === "cell") : "";
    const content = <DisplayValue field={field} value={value} empty={hint} />;
    if (!editable) return <div className={shells[variant]}>{content}</div>;

    const props: EditorProps = {
        field,
        current,
        variant,
        hint,
        content,
        label: `${field.label}: ${displayText(field, value) || "empty"}`,
        onSave: (next) => next !== current && onSave(next),
    };
    if (field.type === "select") return <OptionEditor {...props} />;
    if (field.type === "date") return <DateEditor {...props} />;
    if (field.type === "textarea") return <LongTextEditor {...props} />;
    return <InlineInput {...props} />;
}

function OptionEditor({ field, current, onSave, variant, label, hint }: EditorProps) {
    return (
        <Select value={current} onValueChange={(next) => onSave(next === CLEAR ? "" : next)}>
            <SelectTrigger
                data-cell=""
                aria-label={label}
                className={cn(
                    triggerShells[variant],
                    "border-0 bg-transparent shadow-none hover:bg-muted data-[state=open]:bg-muted dark:bg-transparent dark:hover:bg-muted",
                )}
            >
                <SelectValue
                    placeholder={<span className="text-muted-foreground/70">{hint}</span>}
                />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
                {field.options?.map((option) => (
                    <SelectItem key={optionValue(option)} value={optionValue(option)}>
                        <ValueBadge value={optionLabel(option)} />
                    </SelectItem>
                ))}
                {!field.required && current && (
                    <>
                        <SelectSeparator />
                        <SelectItem value={CLEAR}>Clear</SelectItem>
                    </>
                )}
            </SelectContent>
        </Select>
    );
}

function DateEditor({ field, current, onSave, variant, label, content }: EditorProps) {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Trigger layout={variant} aria-label={label}>
                    {content}
                </Trigger>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <DateCalendar
                    value={current}
                    clearable={!field.required}
                    onChange={(next) => {
                        setOpen(false);
                        onSave(next);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}

function InlineInput({ field, current, onSave, variant, label, content }: EditorProps) {
    const [editing, setEditing] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const cancelled = useRef(false);
    const restoreFocus = useRef(false);

    useEffect(() => {
        if (!editing && restoreFocus.current) {
            restoreFocus.current = false;
            buttonRef.current?.focus();
        }
    }, [editing]);

    if (!editing) {
        return (
            <Trigger
                ref={buttonRef}
                layout={variant}
                aria-label={label}
                onClick={() => {
                    cancelled.current = false;
                    setEditing(true);
                }}
            >
                {content}
            </Trigger>
        );
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === "Escape") {
            event.preventDefault();
            cancelled.current = event.key === "Escape";
            restoreFocus.current = true;
            event.currentTarget.blur();
        }
    };

    return (
        <Input
            autoFocus
            type={field.type}
            defaultValue={current}
            placeholder={placeholderFor(field)}
            min={field.min}
            max={field.max}
            step={field.type === "number" ? (field.step ?? 1) : undefined}
            aria-label={field.label}
            onKeyDown={onKeyDown}
            onBlur={(event) => {
                setEditing(false);
                if (!cancelled.current) onSave(event.currentTarget.value);
            }}
            className={cn(
                "shadow-none focus-visible:ring-2 focus-visible:ring-inset",
                variant === "cell" ? "h-full min-h-9 rounded-none border-0" : "h-8",
            )}
        />
    );
}

function LongTextEditor({ field, current, onSave, variant, label, content }: EditorProps) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(current);
    const close = (save: boolean) => {
        if (save) onSave(draft);
        setOpen(false);
    };

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                if (!next) return close(true);
                setDraft(current);
                setOpen(true);
            }}
        >
            <PopoverTrigger asChild>
                <Trigger layout={variant} aria-label={label}>
                    {content}
                </Trigger>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-80"
                onEscapeKeyDown={(event) => {
                    event.preventDefault();
                    close(false);
                }}
            >
                <Textarea
                    autoFocus
                    rows={6}
                    value={draft}
                    placeholder={placeholderFor(field)}
                    maxLength={field.max}
                    aria-label={field.label}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                            event.preventDefault();
                            close(true);
                        }
                    }}
                />
                <p className="text-xs text-muted-foreground">
                    Ctrl + Enter to save · Esc to cancel
                </p>
            </PopoverContent>
        </Popover>
    );
}
