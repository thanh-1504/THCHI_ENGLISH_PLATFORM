const LearningLayout = ({ children }) => {
  return (
    <div
      className="
      min-h-screen
      bg-[#F5F5F7]
      flex
      justify-center
      items-start
      px-4 sm:px-10
      pt-8
      pb-6
      "
    >
      {children}
    </div>
  );
};

export default LearningLayout;