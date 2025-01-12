import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <div className="fixed w-full top-0 z-50">
      <div
        className="flex justify-between items-center p-2 m-auto w-11/12 rounded-full border-solid border-e-2 border-s-2 z-50 bg-black mt-10
                      xl:border-e-2 xl:border-s-2 xl:h-20 xl:mt-10 xl:z-50
                      lg:border-e-2 lg:border-s-2 lg:h-20 lg:mt-12
                      md:border-e-4 md:border-s-4 md:h-20 md:mt-12
                      sm:border-e-4 sm:border-s-4 sm:h-36 sm:mt-10"
        style={{
          boxShadow: "rgba(102, 116, 204, .50) 0px 4px 10px",
        }}
      >
        <span
          className="ml-5 font-bold animate-pulse cursor-pointer z-50 text-3xl
                            xl:text-5xl lg:text-5xl md:text-5xl sm:text-5xl"
          style={{
            background:
              "linear-gradient(81.02deg, #fa5560 -23.49%, #b14bf4 45.66%, #4d91ff 114.8%)",
            color: "transparent",
            backgroundClip: "text",
          }}
        >
          Impluse
        </span>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;
