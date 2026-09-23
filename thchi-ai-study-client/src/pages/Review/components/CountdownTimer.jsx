import { Hourglass } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CountdownTimer = ({ targetDate }) => {
  const calcTimeLeft = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / 1000 / 3600),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(calcTimeLeft());
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [targetDate]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="relative flex items-center justify-center gap-3 bg-[#e5e5e5] rounded-full px-6 py-3 mx-auto w-fit shadow-sm">
      {/* Hourglass icon */}
      <Hourglass />
      <span className="text-xl font-bold text-black tracking-wider">
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
      {/* Alert badge */}
      <div className="absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 bg-[#ff5c5c] rounded-full text-white text-base font-bold shadow-md border-2 border-white">
        !
      </div>
    </div>
  );
};
export default CountdownTimer;
