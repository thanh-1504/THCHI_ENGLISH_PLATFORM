const ProgressBar = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full bg-white rounded-full h-2.5">
      <div
        className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
