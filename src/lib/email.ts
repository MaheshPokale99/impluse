import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { siteName, siteUrl } from "@/lib/site";

let resend: Resend | null | undefined;

async function sendEmail(message: { to: string; subject: string; html: string; text: string }) {
    const { RESEND_API_KEY, EMAIL_FROM } = env();
    resend ??= RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
    if (!resend) {
        console.info(`[email] To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}`);
        return;
    }
    const { error } = await resend.emails.send({ from: EMAIL_FROM, ...message });
    if (error) throw new Error(`Email to ${message.to} failed: ${error.message}`);
}

const escapeHtml = (value: string) =>
    value.replace(
        /[&<>"']/g,
        (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
    );

export const appUrl = (path: string) => new URL(path, siteUrl).toString();

function layout(heading: string, paragraphs: string[], action: { label: string; url: string }) {
    const body = paragraphs
        .map((p) => `<p style="margin:0 0 16px;line-height:1.6;color:#3a3d42">${p}</p>`)
        .join("");
    return `<!doctype html><html><body style="margin:0;background:#f5f2ed;font-family:Arial,sans-serif">
            <div style="max-width:520px;margin:32px auto;padding:32px;background:#fffdfa;border:1px solid #e4dfd8;border-radius:16px">
            <p style="margin:0 0 24px;font-weight:700;font-size:18px;color:#25282c">${siteName}</p>
            <h1 style="margin:0 0 16px;font-size:22px;color:#25282c">${heading}</h1>${body}
            <a href="${action.url}" style="display:inline-block;margin-top:8px;padding:12px 22px;background:#e95f2c;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">${action.label}</a>
            <p style="margin:24px 0 0;font-size:12px;color:#8a8783">If the button doesn't work, open this link: ${action.url}</p>
            </div></body></html>`;
}

export function sendWelcomeEmail(to: { name: string; email: string }, password: string) {
    const url = appUrl("/login");
    const detail = (label: string, value: string) =>
        `${label}: <strong style="font-family:Consolas,monospace">${escapeHtml(value)}</strong>`;
    return sendEmail({
        to: to.email,
        subject: `Your ${siteName} login details`,
        html: layout(
            `Welcome, ${escapeHtml(to.name)}`,
            [
                `Your mentor has created your ${siteName} account. Use these details to sign in:`,
                `${detail("Website", url)}<br>${detail("Email", to.email)}<br>${detail("Password", password)}`,
                "After signing in, change this password from your Profile page.",
            ],
            { label: "Sign in", url },
        ),
        text: `Welcome, ${to.name}.\n\nYour mentor has created your ${siteName} account. Use these details to sign in:\n\nWebsite: ${url}\nEmail: ${to.email}\nPassword: ${password}\n\nAfter signing in, change this password from your Profile page.`,
    });
}

export function sendPasswordResetEmail(to: { name: string; email: string }, token: string) {
    const url = appUrl(`/reset-password?token=${token}`);
    return sendEmail({
        to: to.email,
        subject: `Reset your ${siteName} password`,
        html: layout(
            "Reset your password",
            [
                `Hi ${escapeHtml(to.name)}, we received a request to reset your password.`,
                "The link expires in 1 hour. If you didn't ask for this, you can ignore this email.",
            ],
            { label: "Reset password", url },
        ),
        text: `Hi ${to.name},\n\nReset your password using this link (expires in 1 hour):\n${url}\n\nIf you didn't ask for this, ignore this email.`,
    });
}
