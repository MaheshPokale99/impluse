import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="p-6 rounded-2xl bg-gray-100 dark:bg-zinc-800 shadow-md border border-gray-200 dark:border-zinc-700"
    >
      <h1 className="font-bold text-left text-sm text-zinc-800 dark:text-gray-300">
        Sarvesh Pokale
      </h1>

      <div className="flex flex-col items-start gap-3 mt-2">
        <p className="text-left font-semibold text-base md:text-lg text-zinc-900 dark:text-white">
          How do I build a strong resume?
        </p>

        <p className="text-justify text-zinc-800 dark:text-gray-300 text-sm md:text-base leading-relaxed">
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
    </motion.div>
  );
};
