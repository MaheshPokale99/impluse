/** Today's date in India as `YYYY-MM-DD`, the format of date columns. */
export const todayInIndia = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
