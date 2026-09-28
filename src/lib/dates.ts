/** Today's date in India as `YYYY-MM-DD`, the format of date columns. */
export const todayInIndia = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const dayFormat = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
});

/** A `YYYY-MM-DD` date as "28 Sep", for short messages. */
export const formatDay = (value: string) => dayFormat.format(new Date(value));
