"use client";

import { useState } from "react";
import { Check, Inbox, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import type { FieldOption } from "@/lib/forms";
import { approveStudent, declineStudent } from "@/lib/students/actions";
import { approvalFields } from "@/lib/students/fields";
import type { Admission } from "@/lib/students/queries";
import { ConfirmAction, FormDialog } from "./dialogs";
import { formatDate, initials } from "./values";

/** Sign-up requests with Approve (choosing a section) and Decline. */
export function AdmissionsList({
    requests,
    sections,
}: {
    requests: Admission[];
    sections: FieldOption[];
}) {
    // One dialog for the list: an approved request leaves the list, and the dialog must stay
    // to show the result (for example, that the email couldn't be sent).
    const [approving, setApproving] = useState<{ request: Admission; open: boolean }>();

    return (
        <>
            {requests.length === 0 ? (
                <Empty className="border-y">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Inbox />
                        </EmptyMedia>
                        <EmptyTitle>No requests waiting</EmptyTitle>
                        <EmptyDescription>
                            New sign-ups from the website appear here, and you get a notification.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <ul className="divide-y border-y">
                    {requests.map((request) => {
                        const details = [
                            request.phone,
                            [request.targetExam, request.targetYear].filter(Boolean).join(" "),
                            request.schoolCollege,
                        ].filter(Boolean);
                        return (
                            <li
                                key={request.id}
                                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
                            >
                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                    <Avatar className="size-9">
                                        <AvatarFallback className="text-xs">
                                            {initials(request.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="font-medium">{request.name}</span>
                                        <span className="truncate text-sm text-muted-foreground">
                                            {request.email}
                                        </span>
                                        {details.length > 0 && (
                                            <span className="text-sm text-muted-foreground">
                                                {details.join(" · ")}
                                            </span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            Requested {formatDate(request.requestedAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex shrink-0 gap-2 pl-12 sm:pl-0">
                                    <Button
                                        size="sm"
                                        onClick={() => setApproving({ request, open: true })}
                                    >
                                        <Check /> Approve
                                    </Button>
                                    <ConfirmAction
                                        title={`Decline ${request.name}?`}
                                        description="The request is deleted. They can sign up again later."
                                        confirmLabel="Decline"
                                        action={declineStudent.bind(null, request.id)}
                                        trigger={
                                            <Button size="sm" variant="outline">
                                                <X /> Decline
                                            </Button>
                                        }
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            {approving && (
                <FormDialog
                    open={approving.open}
                    onOpenChange={(open) => setApproving({ ...approving, open })}
                    title={`Approve ${approving.request.name}`}
                    description="They can then sign in with the password they chose, and get an email saying so. Pick the section they belong to."
                    action={approveStudent.bind(null, approving.request.id)}
                    fields={approvalFields(sections)}
                    submitLabel="Approve"
                />
            )}
        </>
    );
}
