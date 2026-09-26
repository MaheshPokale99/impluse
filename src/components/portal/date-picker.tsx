"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "./values";

function parseIsoDate(value: string) {
    const [year, month, day] = value.split("-").map(Number);
    return year && month && day ? new Date(year, month - 1, day) : undefined;
}

const toIsoDate = (date: Date) =>
    [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map((part) => String(part).padStart(2, "0"))
        .join("-");

export function DateCalendar({
    value,
    onChange,
    clearable,
}: {
    value: string;
    onChange: (value: string) => void;
    clearable: boolean;
}) {
    const selected = parseIsoDate(value);
    return (
        <div className="flex flex-col">
            <Calendar
                mode="single"
                selected={selected}
                defaultMonth={selected}
                captionLayout="dropdown"
                startMonth={new Date(2015, 0)}
                endMonth={new Date(2040, 11)}
                onSelect={(date) => date && onChange(toIsoDate(date))}
            />
            {clearable && value && (
                <div className="border-t p-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => onChange("")}
                    >
                        Clear date
                    </Button>
                </div>
            )}
        </div>
    );
}

export function DatePicker({
    id,
    name,
    defaultValue = "",
    required,
    invalid,
    describedBy,
}: {
    id: string;
    name: string;
    defaultValue?: string;
    required?: boolean;
    invalid?: boolean;
    describedBy?: string;
}) {
    const [value, setValue] = useState(defaultValue);
    const [open, setOpen] = useState(false);
    return (
        <>
            <input type="hidden" name={name} value={value} />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant="outline"
                        aria-invalid={invalid || undefined}
                        aria-describedby={describedBy}
                        className={cn(
                            "w-full justify-start font-normal",
                            !value && "text-muted-foreground",
                        )}
                    >
                        <CalendarIcon />
                        {value ? formatDate(value) : "Pick a date"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <DateCalendar
                        value={value}
                        clearable={!required}
                        onChange={(next) => {
                            setValue(next);
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
        </>
    );
}
