import { FaArrowRightLong } from "react-icons/fa6";
import { ChatShow } from "./ChatShow";
import { motion } from "framer-motion";

const QuerySection = () => {
  return (
    <section className="w-full max-w-6xl flex flex-col mx-auto gap-8 text-center p-6 md:p-10 bg-white dark:bg-zinc-900 shadow-lg rounded-2xl border border-[#EBEBEB]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <h2 className="text-2xl font-semibold md:text-4xl text-zinc-900 dark:text-white">
          Ask a Mentor Anything
        </h2>
        <p className="text-zinc-700 dark:text-zinc-400 text-sm md:text-lg mt-2">
          Get answers from our experienced mentors to shape your career!
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col gap-4 p-6 rounded-2xl bg-gray-100 dark:bg-zinc-800 shadow-md border border-gray-200 dark:border-zinc-700"
      >
        <h2 className="text-lg font-semibold text-left text-zinc-900 dark:text-white">
          Ask your questions here
        </h2>

        <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-4">
          <p className="w-full lg:w-[70%] text-zinc-500 dark:text-zinc-400 border border-gray-300 dark:border-zinc-600 h-14 flex items-center px-4 rounded-lg text-sm md:text-base cursor-pointer bg-white dark:bg-zinc-900 shadow-sm">
            Our mentors are here to help. Submit your queries here...
          </p>

          <button className="custom-button flex items-center justify-center w-full lg:w-[25%] h-14">
            <span>Ask a question</span>
            <FaArrowRightLong className="ml-2 mt-1" />
          </button>
        </div>
      </motion.div>

      <ChatShow />
    </section>
  );
};

export default QuerySection;
