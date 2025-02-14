import { useState, useEffect } from "react";

export const ChatShow = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fullText =
    "Building a strong resume is crucial for making a positive impression on potential employers. Your resume should effectively showcase your skills, experiences, achievements, and qualifications in a clear and organized manner. Here’s a step-by-step guide to help you build a strong resume.";

  const shortText = "Building a strong resume is crucial for making a positive impression...";

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl min-h-44 justify-center"
      style={{
        boxShadow:
          "inset 0 -2px 0 0 rgba(62, 62, 62, .04), 0 3px 6px rgba(0, 0, 0, 0.1), 0 0 0 1px #ebebeb",
      }}
    >
      <h1 className="font-bold text-left text-sm text-zinc-800">Sarvesh Pokale</h1>

      <div className="flex flex-col items-start gap-1 mt-2">
        <p className="text-center font-semibold text-base md:text-lg text-zinc-800">
          How do I build a strong resume?
        </p>

        <p className="text-justify text-zinc-800 text-sm md:text-base leading-relaxed">
          {isMobile ? (expanded ? fullText : shortText) : fullText}
        </p>

        {isMobile && (
          <button
            className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
};
