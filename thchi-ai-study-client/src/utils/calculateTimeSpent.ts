const calculateTimeSpent = (startStr: Date, endStr: Date) => {
  if (!startStr || !endStr) return "00:00";
  
  const startTime = new Date(startStr).getTime();
  const endTime = new Date(endStr).getTime();
  
  const diffInSeconds = Math.floor((endTime - startTime) / 1000);
  
  if (diffInSeconds <= 0) return "00:00";

  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
};
export default calculateTimeSpent;