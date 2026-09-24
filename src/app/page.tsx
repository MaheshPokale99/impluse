import { HomePage } from "@/components/dynarock/home";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl.toString()}#organization`,
      name: siteName,
      url: siteUrl.toString(),
      description: siteDescription,
      logo: new URL("/icon.svg", siteUrl).toString(),
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

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <HomePage />
    </>
  );
}
