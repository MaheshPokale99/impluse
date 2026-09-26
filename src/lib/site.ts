export const siteName = "ImpulseVidya";

export const siteUrl = new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://impulsevidya.in",
);
export const siteDescription =
    "Explore academic choices, entrance exam planning, practical skill-building, and career guidance with a plan shaped around your goals and pace.";
export const socialImagePath = "/images/impulsevidya/mentor-student-conversation.png";
export const socialImageUrl = new URL(socialImagePath, siteUrl).toString();
