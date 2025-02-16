import { HiOutlineVideoCamera } from "react-icons/hi";
import { CiMail } from "react-icons/ci";
import { MdOutlineTask } from "react-icons/md";
import { FaRegClock } from "react-icons/fa6";
import { IoRocketOutline } from "react-icons/io5";
import { BsFileEarmarkMedical } from "react-icons/bs";
import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";

const Features = () => {
  return (
    <div className="w-full max-w-8xl grid grid-cols-1 gap-6 items-center text-center p-3 md:p-7">
      <div className="flex w-full flex-col items-center pt-7 gap-2">
        <h1 className="font-bold text-2xl md:text-4xl text-center text-zinc-900 dark:text-white tracking-wide">
          No need to Struggle Alone Anymore
        </h1>
        <p className="text-zinc-700 dark:text-zinc-300 text-lg md:text-xl text-center">
          Long-term mentorship gets fully covered
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: <HiOutlineVideoCamera />, heading: "1:1 Live Session", para: "Never question your progress with frequent One-on-One sessions." },
          { icon: <CiMail />, heading: "Unlimited Chat with Mentor", para: "Doubt? Get the right advice from your mentor via chat." },
          { icon: <MdOutlineTask />, heading: "Task & Curated Resources", para: "Yes! You will be certified for this mentorship program." },
          { icon: <FaRegClock />, heading: "Regular Follow-ups", para: "Stay motivated and consistent with regular follow-ups." },
          { icon: <IoRocketOutline />, heading: "Job Referrals", para: "Get referrals from the mentor community to top companies." },
          { icon: <BsFileEarmarkMedical />, heading: "Certified", para: "Yes! You will be certified for this mentorship program." },
        ].map((item, index) => (
          <Box key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

const Box = ({ heading, para, icon }) => {
  const boxRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (boxRef.current) observer.observe(boxRef.current);

    return () => {
      if (boxRef.current) observer.unobserve(boxRef.current);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      className="relative bg-white dark:bg-zinc-900 shadow-lg rounded-xl p-6 md:p-8 flex flex-col justify-start overflow-hidden group transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
    >
      {/* Border Animation - Now 2px Thick */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left Border */}
        <div
          className={`absolute left-0 top-0 w-[2px] bg-gradient-to-b from-[#4f46e5] to-[#ec4899] transition-all duration-[1.5s] ease-out ${
            isVisible ? "h-full" : "h-0"
          }`}
        ></div>

        {/* Top Border */}
        <div
          className={`absolute top-0 left-0 h-[2px] bg-gradient-to-r from-[#4f46e5] to-[#ec4899] transition-all duration-[1.5s] ease-out delay-200 ${
            isVisible ? "w-full" : "w-0"
          }`}
        ></div>

        {/* Right Border */}
        <div
          className={`absolute right-0 bottom-0 w-[2px] bg-gradient-to-b from-[#4f46e5] to-[#ec4899] transition-all duration-[1.5s] ease-out delay-400 ${
            isVisible ? "h-full" : "h-0"
          }`}
        ></div>

        {/* Bottom Border */}
        <div
          className={`absolute bottom-0 right-0 h-[2px] bg-gradient-to-r from-[#4f46e5] to-[#ec4899] transition-all duration-[1.5s] ease-out delay-600 ${
            isVisible ? "w-full" : "w-0"
          }`}
        ></div>
      </div>

      {/* Icon */}
      <span className="text-left text-indigo-600 dark:text-pink-400 text-3xl transition-transform duration-500 group-hover:scale-110">
        {icon}
      </span>

      {/* Content */}
      <div className="text-zinc-900 dark:text-white flex flex-col text-left gap-2 mt-6">
        <h1 className="font-semibold text-xl">{heading}</h1>
        <p className="text-lg text-zinc-700 dark:text-zinc-300">{para}</p>
      </div>
    </div>
  );
};

Box.propTypes = {
  icon: PropTypes.node.isRequired,
  para: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
};

export default Features;
