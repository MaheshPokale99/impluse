"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import type { FieldUpdateResult } from "@/lib/students/actions";

type Edit = { id: string; key: string; value: string };

export function useOptimisticEdits<T extends { id: string }>(
    records: T[],
    action: (id: string, key: string, value: string) => Promise<FieldUpdateResult>,
) {
    const [optimistic, applyEdit] = useOptimistic(records, (rows, edit: Edit) =>
        rows.map((row) => (row.id === edit.id ? { ...row, [edit.key]: edit.value } : row)),
    );
    const [saving, startTransition] = useTransition();

    const save = (id: string, key: string, value: string) =>
        startTransition(async () => {
            applyEdit({ id, key, value });
            const result = await action(id, key, value);
            if (!result.ok) toast.error(result.error);
        });

    return { records: optimistic, save, saving };
}
