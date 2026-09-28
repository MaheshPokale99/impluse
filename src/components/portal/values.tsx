import {
    AlignLeft,
    AtSign,
    Calendar,
    CircleChevronDown,
    Hash,
    Phone,
    Type,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { optionLabel, optionValue, type FieldType, type FormFieldDef } from "@/lib/forms";

const dateOptions = { day: "numeric", month: "short", year: "numeric" } as const;
const calendarDate = new Intl.DateTimeFormat("en-IN", { ...dateOptions, timeZone: "UTC" });
const localDateTime = new Intl.DateTimeFormat("en-IN", {
    ...dateOptions,
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
});

/** Formats a `YYYY-MM-DD` column as-is, or a timestamp with its time in Indian time. */
export const formatDate = (value: string | Date) =>
    typeof value === "string" ? calendarDate.format(new Date(value)) : localDateTime.format(value);

const toneClasses = {
    good: "border-success/30 bg-success/10 text-success",
    warn: "border-warning/30 bg-warning/10 text-warning",
    bad: "border-destructive/30 bg-destructive/10 text-destructive",
};

const tones: Record<string, keyof typeof toneClasses> = {
    Excellent: "good",
    Good: "good",
    Improving: "good",
    Active: "good",
    Low: "good",
    Average: "warn",
    Stable: "warn",
    Medium: "warn",
    "On Hold": "warn",
    Weak: "bad",
    Declining: "bad",
    High: "bad",
    Inactive: "bad",
};

export function ValueBadge({ value }: { value: string }) {
    const tone = tones[value];
    return (
        <Badge variant={tone ? "outline" : "secondary"} className={cn(tone && toneClasses[tone])}>
            {value}
        </Badge>
    );
}

const isEmpty = (value: unknown) => value == null || value === "";

/** A select's stored value shown as its option label (e.g. a section's name, not its ID). */
const selectLabel = (field: FormFieldDef, value: unknown) => {
    const option = field.options?.find((candidate) => optionValue(candidate) === String(value));
    return option ? optionLabel(option) : String(value);
};

export const displayText = (field: FormFieldDef, value: unknown) => {
    if (isEmpty(value)) return "";
    if (field.type === "date") return formatDate(String(value));
    if (field.type === "select") return selectLabel(field, value);
    return `${value}${field.unit ?? ""}`;
};

export function DisplayValue({
    field,
    value,
    empty = "",
}: {
    field: FormFieldDef;
    value: unknown;
    empty?: string;
}) {
    if (isEmpty(value)) return <span className="text-muted-foreground/70">{empty}</span>;
    if (field.type === "select") return <ValueBadge value={selectLabel(field, value)} />;
    if (field.type === "textarea") {
        return <span className="line-clamp-2 whitespace-pre-line">{String(value)}</span>;
    }
    return (
        <span className={cn("truncate", field.type === "number" && "tabular-nums")}>
            {displayText(field, value)}
        </span>
    );
}

const icons: Record<FieldType, LucideIcon> = {
    text: Type,
    email: AtSign,
    tel: Phone,
    password: Type,
    textarea: AlignLeft,
    number: Hash,
    date: Calendar,
    select: CircleChevronDown,
};

export function FieldIcon({ type, className }: { type: FieldType; className?: string }) {
    const Icon = icons[type];
    return (
        <Icon className={cn("size-3.5 shrink-0 text-muted-foreground", className)} aria-hidden />
    );
}

/** Up to two initials for an avatar, e.g. "Riya Sharma" → "RS". */
export const initials = (name: string) =>
    name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
