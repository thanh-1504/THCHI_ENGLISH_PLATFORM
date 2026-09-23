import { Flame, PiggyBank, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";

const Premium = () => {
  const navigate = useNavigate();
  const INITIAL_TIME_IN_SECONDS = 16200;
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_IN_SECONDS);
  const plans = useLoaderData();

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (totalSeconds) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const padZero = (num) => num.toString().padStart(2, "0");
    return {
      days: padZero(days),
      hours: padZero(hours),
      minutes: padZero(minutes),
      seconds: padZero(seconds),
    };
  };

  const { days, hours, minutes, seconds } = formatTime(timeLeft);

  return (
    <div className="min-h-screen bg-[#fafaf7] relative overflow-hidden font-sans pb-20">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#fff6d6] rounded-full blur-3xl -z-10 opacity-70"></div>

      {/* HEADER BANNER */}
      <div className="bg-[#ffcb08] w-full py-3 px-4 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 shadow-sm z-10 relative">
        <div className="flex items-center gap-2 font-black text-white text-2xl tracking-tight">
          <button
            onClick={() => navigate("/review")}
            className="text-white cursor-pointer"
          >
            THCHI
          </button>
        </div>

        <h2 className="font-bold text-[#333] text-[18px]">
          Ưu đãi 30% dành cho học viên Việt Nam
        </h2>

        {/* COUNTDOWN TIMER */}
        <div className="flex gap-1.5 text-white text-center font-bold">
          <div className="bg-[#1eb54b] rounded pb-1 px-2 min-w-[44px]">
            <div className="text-[22px] leading-tight">{days}</div>
            <div className="text-[11px] font-normal">Ngày</div>
          </div>
          <div className="bg-[#1eb54b] rounded pb-1 px-2 min-w-[44px]">
            <div className="text-[22px] leading-tight">{hours}</div>
            <div className="text-[11px] font-normal">Giờ</div>
          </div>
          <div className="bg-[#1eb54b] rounded pb-1 px-2 min-w-[44px]">
            <div className="text-[22px] leading-tight">{minutes}</div>
            <div className="text-[11px] font-normal">Phút</div>
          </div>
          <div className="bg-[#1eb54b] rounded pb-1 px-2 min-w-[44px]">
            <div className="text-[22px] leading-tight">{seconds}</div>
            <div className="text-[11px] font-normal">Giây</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1000px] mx-auto mt-16 px-6 flex flex-col md:flex-row items-center md:items-start gap-12 z-10 relative">
        <div className="w-full md:w-[35%] pt-4 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 mb-6">
            <span className="font-black text-[#ffcb08] text-2xl tracking-tighter">
              <span className="text-[#333]"></span>THCHIVOCAB
            </span>
            <span className="bg-[#f08533] text-white text-[11px] font-bold px-2 py-1 rounded-md">
              PREMIUM
            </span>
          </div>

          <h1 className="text-[32px] md:text-[40px] leading-[1.2] font-bold text-gray-800 mb-4">
            Chọn gói học phù hợp với bạn
          </h1>
          <p className="text-gray-600 text-[17px] mb-4">
            Thanh toán 1 lần, mở mọi tính năng
          </p>
          <div className="flex items-center gap-2 text-[#2bb442] font-medium text-sm">
            <Tag size={18} />
            <span>Đang có ưu đãi 30% tất cả các gói</span>
          </div>
        </div>

        <div className="w-full md:w-[65%] flex flex-col sm:flex-row gap-6">
          {plans.data && plans.data.length > 0 ? (
            plans.data.map((plan, index) => {
              const isHighlighted = index === 0;
              const isOrangeBadge = index === 0;

              const badgeText =
                plan.badge ||
                (isOrangeBadge ? "Được yêu thích" : "Tiết kiệm hơn");

              const monthlyPrice =
                plan.duration === "ONE_YEAR"
                  ? Math.round(plan.price / 12)
                  : plan.duration === "THREE_YEARS"
                    ? Math.round(plan.price / 36)
                    : plan.duration === "THREE_MONTHS"
                      ? Math.round(plan.price / 3)
                      : plan.price;

              const durationText =
                plan.duration === "ONE_YEAR"
                  ? "/1 năm"
                  : plan.duration === "THREE_YEARS"
                    ? "/3 năm"
                    : plan.duration === "THREE_MONTHS"
                      ? "/3 tháng"
                      : "/1 tháng";

              return (
                <div
                  key={plan.id}
                  className={`flex-1 bg-white rounded-3xl p-8 relative flex flex-col transition-transform duration-300 hover:scale-[1.04] ${
                    isHighlighted
                      ? "border-2 border-[#2bb442] shadow-[0_10px_40px_rgba(43,180,66,0.15)]"
                      : "border border-gray-200 shadow-sm"
                  }`}
                >
                  {badgeText && (
                    <div
                      className={`flex items-center gap-1.5 font-bold text-sm mb-4 ${
                        isOrangeBadge ? "text-[#f08533]" : "text-[#42a5f5]"
                      }`}
                    >
                      {isOrangeBadge ? (
                        <Flame size={18} fill="currentColor" />
                      ) : (
                        <PiggyBank size={18} />
                      )}
                      <span>{badgeText}</span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {plan.name || (isOrangeBadge ? "Gói 1 năm" : "Gói 3 năm")}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-10 h-[60px]">
                    {plan.description}
                  </p>

                  <div className="mt-auto">
                    {plan.originalPrice && (
                      <p className="text-gray-400 line-through text-sm font-medium mb-1">
                        {Number(plan.originalPrice).toLocaleString("vi-VN")}đ
                      </p>
                    )}

                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-[32px] font-black text-gray-900 leading-none">
                        {Number(plan.price).toLocaleString("vi-VN")}đ
                      </span>
                      <span className="text-gray-600 font-medium whitespace-nowrap">
                        {durationText}
                      </span>
                    </div>
                    <p className="text-[#2bb442] font-medium text-sm mb-6">
                      ~ {monthlyPrice.toLocaleString("vi-VN")}đ/tháng
                    </p>

                    <button
                      onClick={() =>
                        navigate(`/checkout/${plan.id}`, {
                          state: {
                            plan,
                          },
                        })
                      }
                      className="bg-[#2bb442] text-white font-bold py-2 px-6 rounded-full hover:opacity-90 cursor-pointer"
                    >
                      Nâng cấp ngay
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">Không có gói ưu đãi nào.</p>
          )}
        </div>
      </div>

      {/* FOOTER LINK */}
      <div className="text-center mt-12">
        <a
          href="#"
          className="text-blue-500 hover:text-blue-600 font-medium underline underline-offset-2"
        >
          Chưa chắc chọn gói nào? Thchi tư vấn ngay!
        </a>
      </div>
    </div>
  );
};

export default Premium;
