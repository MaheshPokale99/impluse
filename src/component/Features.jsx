import { HiOutlineVideoCamera } from "react-icons/hi";
import { CiMail } from "react-icons/ci";
import { MdOutlineTask } from "react-icons/md";
import { FaRegClock } from "react-icons/fa6";
import { IoRocketOutline } from "react-icons/io5";
import { BsFileEarmarkMedical } from "react-icons/bs";
import PropTypes from "prop-types";

const Features = () => {
  return (
    <div className="w-full max-w-8xl grid grid-cols-1 gap-6 items-center text-center p-3 md:p-7">
      <div className="flex w-full flex-col items-center pt-7 gap-2">
        <h1 className="font-semibold text-xl md:text-3xl text-center">No need to Struggle Alone Anymore</h1>
        <p className="text-zinc-800 dark:text-zinc-300 text-base text-center">Long-term mentorship gets fully covered</p>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-[#EBEBEB] dark:border-zinc-600 dark:border-[1px]">
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
  return (
    <div className="relative border p-6 md:p-8 flex flex-col justify-start border-[#EBEBEB] dark:border-zinc-600 dark:border-[1px]">
      
      <div className="absolute -left-[5px] -top-[5px] z-[1] h-[9px] w-[9px] border bg-white dark:bg-zinc-800 dark:border-zinc-500"></div>
      <div className="absolute -right-[5px] -top-[5px] z-[1] h-[9px] w-[9px] border bg-white dark:bg-zinc-800 dark:border-zinc-500"></div>
      <div className="absolute -left-[5px] -bottom-[5px] z-[1] h-[9px] w-[9px] border bg-white dark:bg-zinc-800 dark:border-zinc-500"></div>
      <div className="absolute -right-[5px] -bottom-[5px] z-[1] h-[9px] w-[9px] border bg-white dark:bg-zinc-800 dark:border-zinc-500"></div>

      <span className="text-left text-red-600 text-2xl">{icon}</span>
      <div className="text-zinc-800 dark:text-white flex flex-col text-left gap-2 mt-6">
        <h1 className="font-semibold text-lg">{heading}</h1>
        <p className="text-base text-zinc-600 dark:text-zinc-300">{para}</p>
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
