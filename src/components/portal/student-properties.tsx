"use client";

import type { Role } from "@/lib/db/schema";
import { updateStudentField } from "@/lib/students/actions";
import { canEdit, type StudentField, type StudentRecord } from "@/lib/students/fields";
import { EditableValue } from "./editable-value";
import { useOptimisticEdits } from "./use-optimistic-edits";
import { FieldIcon } from "./values";

/** A student's profile details as page properties: label on the left, value editable in place. */
export function StudentProperties({
    student,
    fields,
    role,
    viewerId,
}: {
    student: StudentRecord;
    fields: readonly StudentField[];
    role: Role;
    viewerId: string;
}) {
    const {
        records: [record],
        save,
    } = useOptimisticEdits([student], updateStudentField);

    return (
        <dl className="grid gap-x-12 gap-y-0.5 lg:grid-cols-2">
            {fields.map((field) => (
                <div
                    key={field.name}
                    className="grid grid-cols-[8.5rem_1fr] items-center gap-2 sm:grid-cols-[10rem_1fr]"
                >
                    <dt className="flex min-h-8 items-center gap-2 text-sm text-muted-foreground">
                        <FieldIcon type={field.type} />
                        {field.label}
                    </dt>
                    <dd className="min-w-0">
                        <EditableValue
                            variant="property"
                            field={field}
                            value={record[field.name]}
                            editable={canEdit(role, record.id === viewerId, field)}
                            onSave={(value) => save(record.id, field.name, value)}
                        />
                    </dd>
                </div>
            ))}
        </dl>
    );
}
