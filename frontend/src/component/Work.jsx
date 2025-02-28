import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";

const Work = () => {
  const imageRefs = useRef([]);
  const [visibleIndexes, setVisibleIndexes] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIndexes((prev) => {
          const newIndexes = new Set(prev);
          entries.forEach((entry) => {
            const index = imageRefs.current.indexOf(entry.target);
            if (entry.isIntersecting) {
              newIndexes.add(index);
            } else {
              newIndexes.delete(index);
            }
          });
          return newIndexes;
        });
      },
      { threshold: window.innerWidth < 768 ? 0.2 : 0.3 }
    );

    imageRefs.current.forEach((img) => img && observer.observe(img));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center transition-all duration-500 p-10">
      <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-12 text-center">
        Our <span className="text-blue-500">Creative Work</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {[assets.work1, assets.work2, assets.work3].map((image, index) => (
          <motion.div
            key={index}
            ref={(el) => (imageRefs.current[index] = el)}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: index * 0.2 }}
            whileHover={{ scale: 1.08, transition: { duration: 0.4, ease: "easeOut" } }}
            className="relative rounded-3xl overflow-hidden shadow-2xl p-1"
          >
            <motion.div
              className="absolute inset-0 rounded-3xl"
              animate={{
                background:
                  "linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, transparent)",
                backgroundSize: "300% 300%",
                backgroundPosition: ["0% 50%", "100% 50%"],
                opacity: 0.8,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "linear",
              }}
            />

            <div className="relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
              <motion.img
                src={image}
                alt="Project"
                className="w-full h-80 object-cover rounded-3xl transition-transform duration-500 ease-in-out"
                whileHover={{
                  scale: 1.04,
                  transition: { duration: 0.5, ease: "easeInOut" },
                }}
              />

              {!visibleIndexes.has(index) && (
                <motion.div
                  className="absolute inset-0 bg-black/50 dark:bg-gray-900/60 flex flex-col items-center justify-center transition-all duration-500"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  whileHover={{
                    opacity: 0,
                    transition: { duration: 0.5, ease: "easeInOut" },
                  }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Work;
