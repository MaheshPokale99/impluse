import { FaArrowRightLong } from "react-icons/fa6";
import { ChatShow } from "./ChatShow";

const QuerySection = () => {
    return (
        <section className="w-full max-w-6xl grid grid-cols-1 gap-6 items-center text-center p-3 md:p-7 md:border-x md:border-[#EBEBEB] ">
            {/* Heading Section */}
            <div className="flex flex-col items-center">
                <h2 className="pb-4 text-xl font-semibold md:pb-6 md:text-3xl text-zinc-950">
                    Ask Mentor Anything
                </h2>
                <p className="text-zinc-800 text-sm md:text-lg">
                    Get answers from our mentors in the forum. They are here to help with your questions about your career.
                </p>
            </div>

            {/* Question Section */}
            <div className="flex flex-col gap-2 p-4 rounded-xl min-h-44 justify-center"
                style={{
                    boxShadow: "inset 0 -2px 0 0 rgba(62, 62, 62, .04), 0 3px 6px rgba(0, 0, 0, 0.1), 0 0 0 1px #ebebeb",
                }}
            >
                <h2 className="text-lg font-semibold text-left text-zinc-950">
                    Ask your questions here
                </h2>

                <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-4">
                    <p className="w-full lg:w-[70%] text-zinc-400 border border-[#ebdfdf] h-14 flex items-center p-4 rounded-lg text-sm md:text-base cursor-pointer">
                        Our mentors are here to help. Directly submit your questions or doubts to them...
                    </p>

                    <button className="custom-button flex items-center m-auto gap-2 w-full lg:w-[25%] h-14">
                        <span>Ask a question</span>
                        <FaArrowRightLong className="mt-1" />
                    </button>
                </div>

            </div>

            <ChatShow></ChatShow>

        </section>
    );
};

export default QuerySection;
