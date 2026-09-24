import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "lenis/dist/lenis.css";
import "./impulsevidya.css";
import "./impulsevidya-overrides.css";
import { SiteShell } from "@/components/impulsevidya/shell";
import { siteDescription, siteName, siteUrl, socialImagePath } from "@/lib/site";
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
    metadataBase: siteUrl,
    title: {
        default: "ImpulseVidya | Academic & Career Guidance for Students",
        template: "%s | ImpulseVidya",
    },
    description: siteDescription,
    applicationName: siteName,
    category: "education",
    keywords: [
        "student guidance",
        "academic guidance for students",
        "career guidance for students",
        "entrance exam planning",
        "student mentorship",
        "skills and projects",
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    alternates: { canonical: "/" },
    icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico" }] },
    openGraph: {
        type: "website",
        locale: "en_IN",
        url: "/",
        siteName,
        title: "ImpulseVidya | Academic & Career Guidance for Students",
        description: siteDescription,
        images: [
            {
                url: socialImagePath,
                width: 1536,
                height: 1024,
                alt: "A mentor talking through study choices with students",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "ImpulseVidya | Academic & Career Guidance for Students",
        description: siteDescription,
        images: [socialImagePath],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en-IN" className={`${inter.variable} ${manrope.variable}`}>
            <body>
                <SiteShell>{children}</SiteShell>
            </body>
        </html>
    );
}
