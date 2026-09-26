import type { FormFieldDef } from "@/lib/forms";

export const MIN_PASSWORD_LENGTH = 8;

export const accountFields = {
    name: {
        name: "name",
        label: "Full name",
        type: "text",
        required: true,
        max: 120,
        autoComplete: "name",
    },
    email: { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
    phone: {
        name: "phone",
        label: "Phone",
        type: "tel",
        autoComplete: "tel",
        placeholder: "+91 98765 43210",
    },
    newPassword: {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        min: MIN_PASSWORD_LENGTH,
        autoComplete: "new-password",
        hint: `At least ${MIN_PASSWORD_LENGTH} characters.`,
    },
    currentPassword: {
        name: "currentPassword",
        label: "Current password",
        type: "password",
        required: true,
        autoComplete: "current-password",
    },
} satisfies Record<string, FormFieldDef>;

export const loginFields: FormFieldDef[] = [
    accountFields.email,
    { ...accountFields.currentPassword, name: "password", label: "Password" },
];

export const changePasswordFields: FormFieldDef[] = [
    accountFields.currentPassword,
    { ...accountFields.newPassword, label: "New password" },
];

export const profileFields: FormFieldDef[] = [accountFields.name, accountFields.phone];
