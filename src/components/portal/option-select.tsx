"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { optionLabel, optionValue, type FieldOption } from "@/lib/forms";

const NONE = "__none__";

export function FilterSelect({
    label,
    value,
    options,
    onChange,
    className,
}: {
    label: string;
    value: string;
    options: readonly FieldOption[];
    onChange: (value: string) => void;
    className?: string;
}) {
    return (
        <Select value={value || NONE} onValueChange={(next) => onChange(next === NONE ? "" : next)}>
            <SelectTrigger aria-label={`Filter by ${label}`} className={className}>
                <span className="text-muted-foreground">{label}:</span>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={NONE}>All</SelectItem>
                {options.map((option) => (
                    <SelectItem key={optionValue(option)} value={optionValue(option)}>
                        {optionLabel(option)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

/** A form dropdown; submits its value through a hidden input so it works with FormData. */
export function FormSelect({
    id,
    name,
    options,
    defaultValue = "",
    required,
    invalid,
    describedBy,
    placeholder,
}: {
    id: string;
    name: string;
    options: readonly FieldOption[];
    placeholder: string;
    defaultValue?: string;
    required?: boolean;
    invalid?: boolean;
    describedBy?: string;
}) {
    const [value, setValue] = useState(defaultValue);
    return (
        <>
            <input type="hidden" name={name} value={value} />
            <Select value={value} onValueChange={(next) => setValue(next === NONE ? "" : next)}>
                <SelectTrigger
                    id={id}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                    className={cn("w-full", !value && "text-muted-foreground")}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {!required && value && <SelectItem value={NONE}>None</SelectItem>}
                    {options.map((option) => (
                        <SelectItem key={optionValue(option)} value={optionValue(option)}>
                            {optionLabel(option)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    );
}
