export const siteName = "ImpuseViday";
// Set NEXT_PUBLIC_SITE_URL to the final custom domain before a production build.
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://impuseviday-guidance.sunny-lake-6464.chatgpt.site",
);
export const siteDescription =
  "Explore academic choices, entrance exam planning, practical skill-building, and career guidance with a plan shaped around your goals and pace.";
export const socialImagePath = "/images/impuseviday/mentor-student-conversation.png";
export const socialImageUrl = new URL(socialImagePath, siteUrl).toString();
