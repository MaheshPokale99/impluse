import { HomePage } from "@/components/impulsevidya/home";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import { listPublishedTestimonials, type PublicTestimonial } from "@/lib/testimonials/queries";

export const revalidate = 3600;

const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": `${siteUrl.toString()}#organization`,
            name: siteName,
            url: siteUrl.toString(),
            description: siteDescription,
            logo: new URL("/Logo.png", siteUrl).toString(),
        },
        {
            "@type": "WebSite",
            "@id": `${siteUrl.toString()}#website`,
            name: siteName,
            url: siteUrl.toString(),
            description: siteDescription,
            inLanguage: "en-IN",
            publisher: { "@id": `${siteUrl.toString()}#organization` },
        },
    ],
};

async function publishedTestimonials(): Promise<PublicTestimonial[]> {
    try {
        return await listPublishedTestimonials();
    } catch (error) {
        console.error("Could not load testimonials", error);
        return [];
    }
}

export default async function Home() {
    const testimonials = await publishedTestimonials();
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
                }}
            />
            <HomePage testimonials={testimonials} />
        </>
    );
}
