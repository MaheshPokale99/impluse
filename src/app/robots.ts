import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/dashboard", "/login", "/forgot-password", "/reset-password"],
        },
        sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    };
}
