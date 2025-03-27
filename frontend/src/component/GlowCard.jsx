import { motion } from "framer-motion";
import { FaShareSquare } from "react-icons/fa";

const GlowCard = () => {
  return (
    <motion.div
      className="relative flex items-center justify-center w-28 h-28 max-w-[116px] bg-gradient-to-br from-[hsl(var(--hue-1),70%,50%)] to-[hsl(var(--hue-2),95%,45%)] rounded-lg cursor-pointer overflow-hidden shadow-lg"
      whileHover={{
        scale: 1.1,
        transition: { duration: 0.5, ease: "easeOut" },
      }}
    >
      {/* Glowing Effect */}
      <motion.div
        className="absolute inset-0 bg-transparent"
        whileHover={{
          background:
            "radial-gradient(circle, rgba(255,105,180,0.7) 10%, rgba(255,69,0,0.5) 60%, rgba(0,0,0,1) 100%)",
          opacity: 1,
          transition: { duration: 0.5, ease: "easeOut" },
        }}
      ></motion.div>

      {/* Icon */}
      <motion.div
        whileHover={{
          scale: 1.3,
          color: "#FF69B4",
          transition: { duration: 0.3 },
        }}
        className="relative z-10 p-4 bg-white/20 rounded-md"
      >
        <FaShareSquare className="text-white text-3xl" />
      </motion.div>
    </motion.div>
  );
};

export default GlowCard;
