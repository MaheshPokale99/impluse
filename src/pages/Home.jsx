import { FaArrowRightLong } from "react-icons/fa6";
import { RiLightbulbFlashLine } from "react-icons/ri";
import { LiaGripfire } from "react-icons/lia";
import { IoIosFlash } from "react-icons/io";
import QuerySection from "../component/QuerySection";
import PropTypes from "prop-types";
import Features from "../component/Features";


const HomePage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="bg-gradient-to-b from-sky-100 to-white dark:from-zinc-900 dark:to-black w-full px-4 sm:px-8 py-10 flex flex-col items-center transition-all duration-1000">
        {/* heading section */}
        <div className="text-center mt-24 md:mt-36 flex flex-col items-center">
          <h1 className="text-black dark:text-white font-semibold text-2xl sm:text-3xl md:text-5xl">
            Supercharge your career with
          </h1>
          <h1 className="text-blue-600 dark:text-blue-400 font-semibold text-2xl sm:text-3xl md:text-5xl mt-2">
            Long Term Mentorship
          </h1>
          <p className="text-slate-600 mt-3 dark:text-zinc-400 text-sm sm:text-base md:text-base">
            Helping students turn dreams into reality because the right guidance makes all the difference.
          </p>

          <div className="flex flex-col items-center justify-center md:flex-row gap-4 mt-12 w-full">
            <button className="custom-button-light w-[90%] md:w-[35%] h-14">
              Start Now
              <span className="shine-effect"></span>
            </button>
            <button className="custom-button w-[90%] md:w-[35%] h-14">
              <span>Find your Mentor</span>
              <FaArrowRightLong className="ml-2 mt-1" />
              <span className="shine-effect"></span>
            </button>
          </div>

        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 lg:flex lg:flex-row gap-4 lg:gap-6 items-start mt-8">
          <FeatureItem
            icon={<RiLightbulbFlashLine className="text-[#FFD700] text-xl sm:text-2xl" />}
            text="Unlock Your Potential with Mentorship"
          />
          <FeatureItem
            icon={<LiaGripfire className="text-[#FFD700] text-xl sm:text-2xl " />}
            text="Fuel Your Dreams with the Right Mentors"
          />
          <FeatureItem
            icon={<IoIosFlash className="text-[#FFD700] text-xl sm:text-2xl" />}
            text="Empowering Students, Transforming Careers"
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 w-full md:w-[90%]  mx-auto items-center">
        <Features></Features>
      </div>

      {/* Question Section */}
      <div className="flex flex-col flex-1 w-full md:w-[90%]  mx-auto items-center rounded-[32px] border border-[#EBEBEB] bg-gradient-to-b from-[#F7F7F7] to-[#fff] py-5">
        <QuerySection />
      </div>

    </div>
  );
};

const FeatureItem = ({ icon, text }) => (
  <div className="flex items-center gap-2">
    <div className="w-6 flex justify-center">{icon}</div>
    <span className="text-slate-600 dark:text-zinc-400 text-base">{text}</span>
  </div>
);

FeatureItem.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
};

export default HomePage;
