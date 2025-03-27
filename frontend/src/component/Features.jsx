import { ThemeContext } from "../context/ThemeContext";
import styled from "styled-components";
import PropTypes from "prop-types";
import { HiOutlineVideoCamera } from "react-icons/hi";
import { CiMail } from "react-icons/ci";
import { MdOutlineTask } from "react-icons/md";
import { FaRegClock } from "react-icons/fa6";
import { IoRocketOutline } from "react-icons/io5";
import { BsFileEarmarkMedical } from "react-icons/bs";
import { useContext } from "react";

const Features = () => {
  return (
    <div className="w-full max-w-8xl grid grid-cols-1 gap-6 items-center text-center p-3 md:p-7">
      <div className="flex w-full flex-col items-center pt-7 gap-2">
        <h1 className="text-blue-600 dark:text-blue-400 font-bold text-3xl sm:text-4xl md:text-6xl">
          No need to Struggle Alone Anymore
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
          Long-term mentorship gets fully covered
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[
          { icon: <HiOutlineVideoCamera />, heading: "1:1 Live Session", para: "Never question your progress with frequent One-on-One sessions." },
          { icon: <CiMail />, heading: "Unlimited Chat with Mentor", para: "Doubt? Get the right advice from your mentor via chat." },
          { icon: <MdOutlineTask />, heading: "Task & Curated Resources", para: "Yes! You will be certified for this mentorship program." },
          { icon: <FaRegClock />, heading: "Regular Follow-ups", para: "Stay motivated and consistent with regular follow-ups." },
          { icon: <IoRocketOutline />, heading: "Job Referrals", para: "Get referrals from the mentor community to top companies." },
          { icon: <BsFileEarmarkMedical />, heading: "Certified", para: "Yes! You will be certified for this mentorship program." },
        ].map((item, index) => (
          <Card key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

const Card = ({ heading, para, icon }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledWrapper theme={theme}>
      <div
        className={`card mx-auto border-none w-[95%] sm:w-[80%] md:w-full p-6 rounded-lg transition-all duration-300
        ${theme === "dark" ? "bg-zinc-800" : "bg-white"}
      `}
        style={{
          boxShadow:
            theme !== "dark"
              ? ""
              : "20px 20px 60px #1e1e1e, -20px -20px 60px #3f3f3f",
        }}
      >
        <div
          className="bg w-[98%] mx-auto rounded-md shadow-md transition-all duration-300 dark:bg-zinc-800"
          style={{
            background: theme !== "dark" ? "rgba(255, 255, 255, 0.95)" : "",
          }}
        />
        <div className="blob w-[97%]"
          style={{
            background: theme !== "dark" ? "#ff0000" : "",
          }}
        />

        <div className="relative z-50 my-8 md:my-12">
          <div className="flex items-center justify-start space-x-4 mb-6 md:mb-8">
            <span className="text-3xl md:text-3xl text-red-500 font-bold">{icon}</span>
            <h1 className="text-blue-600 text-xl md:text-2xl font-bold">{heading}</h1>
          </div>
          <p className="text-zinc-500 text-base text-center">{para}</p>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    position: relative;
    height: 250px;
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .bg {
    position: absolute;
    top: 5px;
    left: 5px;
    height: 240px;
    z-index: 2;
    backdrop-filter: blur(24px);
    border-radius: 10px;
    overflow: hidden;
    outline: 2px solid white;
  }

  .blob {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    height: 150px;
    border-radius: 50%;
    background-color: ${({ theme }) => (theme === "dark" ? "#007bff" : "#ff0000")};
    opacity: 1;
    filter: blur(12px);
    animation: blob-bounce 5s infinite ease;
  }


  @keyframes blob-bounce {
    0% {
      transform: translate(-100%, -100%) translate3d(0, 0, 0);
    }
    25% {
      transform: translate(-100%, -100%) translate3d(100%, 0, 0);
    }
    50% {
      transform: translate(-100%, -100%) translate3d(100%, 100%, 0);
    }
    75% {
      transform: translate(-100%, -100%) translate3d(0, 100%, 0);
    }
    100% {
      transform: translate(-100%, -100%) translate3d(0, 0, 0);
    }
  }
`;

Card.propTypes = {
  icon: PropTypes.node.isRequired,
  para: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
};

export default Features;