"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Folder, FolderX, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { optionLabel, optionValue, type FieldOption } from "@/lib/forms";
import { createSectionWithStudent } from "@/lib/sections/actions";
import { sectionFields } from "@/lib/sections/fields";
import { updateStudentField } from "@/lib/students/actions";
import { FormDialog } from "./dialogs";

type MovableStudent = { id: string; name: string; sectionId: string | null };

export function useMoveStudent() {
    const [moving, startMoving] = useTransition();
    const move = (student: MovableStudent, sectionId: string, sectionName: string) =>
        startMoving(async () => {
            const result = await updateStudentField(student.id, "sectionId", sectionId);
            if (result.ok) toast.success(`${student.name} moved to ${sectionName}.`);
            else toast.error(result.error);
        });
    return { move, moving };
}

export function SectionMoveItems({
    student,
    sections,
    onMove,
    onNewSection,
}: {
    student: MovableStudent;
    sections: readonly FieldOption[];
    onMove: ReturnType<typeof useMoveStudent>["move"];
    onNewSection: () => void;
}) {
    const others = sections.filter((section) => optionValue(section) !== student.sectionId);
    const inSection = others.length < sections.length;
    return (
        <>
            {others.map((section) => (
                <DropdownMenuItem
                    key={optionValue(section)}
                    onSelect={() => onMove(student, optionValue(section), optionLabel(section))}
                >
                    <Folder />
                    <span className="truncate">{optionLabel(section)}</span>
                </DropdownMenuItem>
            ))}
            {inSection && (
                <DropdownMenuItem onSelect={() => onMove(student, "", "No section")}>
                    <FolderX /> No section
                </DropdownMenuItem>
            )}
            {(others.length > 0 || inSection) && <DropdownMenuSeparator />}
            <DropdownMenuItem onSelect={onNewSection}>
                <Plus /> New section…
            </DropdownMenuItem>
        </>
    );
}

export function NewSectionForStudent({
    student,
    open,
    onOpenChange,
}: {
    student: MovableStudent;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            title="New section"
            description={`${student.name} moves into the new section.`}
            action={createSectionWithStudent.bind(null, student.id)}
            fields={sectionFields}
            submitLabel="Add section"
        />
    );
}

export function SectionPicker({
    student,
    sections,
}: {
    student: MovableStudent;
    sections: readonly FieldOption[];
}) {
    const { move, moving } = useMoveStudent();
    const [creating, setCreating] = useState(false);
    const current = sections.find((section) => optionValue(section) === student.sectionId);
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={moving}
                        aria-label={`Section of ${student.name}: ${current ? optionLabel(current) : "none"}. Change section`}
                        className="-ml-2 h-7 max-w-full justify-start gap-1 px-2 font-normal"
                    >
                        <span className={cn("truncate", !current && "text-muted-foreground/70")}>
                            {current ? optionLabel(current) : "Select"}
                        </span>
                        <ChevronDown className="opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-52">
                    <DropdownMenuLabel>Move to section</DropdownMenuLabel>
                    <SectionMoveItems
                        student={student}
                        sections={sections}
                        onMove={move}
                        onNewSection={() => setCreating(true)}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
            <NewSectionForStudent student={student} open={creating} onOpenChange={setCreating} />
        </>
    );
}
