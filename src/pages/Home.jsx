const HomePage = () => {
  return (
    <div className="bg-gradient-to-b from-sky-100 to-sky-50 dark:from-zinc-900 dark:to-black min-h-screen w-full absolute px-4 sm:px-8">
      <div className="flex flex-col items-center mt-36 md:mt-40 text-center">
        <h1 className="text-black dark:text-white font-semibold text-2xl sm:text-3xl md:text-5xl">
          Supercharge your career with
        </h1>
        <h1 className="text-blue-600 dark:text-blue-400 font-semibold text-2xl sm:text-3xl md:text-5xl mt-2">
          Long Term Mentorship
        </h1>
        <p className="text-slate-600 mt-3 dark:text-zinc-400 text-sm sm:text-base md:text-lg">
          Helping students turn dreams into reality because the right guidance makes all the difference.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
36