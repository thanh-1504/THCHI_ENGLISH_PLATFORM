import { useMemo } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import RecommendationUI from "../../components/RecommendationUI";
import reviewService from "../../services/review.service";
import CountdownTimer from "./components/CountdownTimer";

const Review = () => {
  const navigate = useNavigate();
  const { isNotebookEmpty, wordsDue, nextReviewAt, upcomingCount, levelStats } =
    useLoaderData();

  const hasDue = wordsDue && wordsDue.length > 0;
  const hasUpcoming = !hasDue && !!nextReviewAt;

  const displayCount = hasDue
    ? wordsDue.length
    : hasUpcoming
      ? upcomingCount
      : 0;

  const dynamicData = useMemo(() => {
    const stats = levelStats ?? {};
    return [
      { level: "1", count: stats["LEVEL_1"] ?? 0, color: "#ff5c5c" },
      { level: "2", count: stats["LEVEL_2"] ?? 0, color: "#ffcb08" },
      { level: "3", count: stats["LEVEL_3"] ?? 0, color: "#4dd0e1" },
      { level: "4", count: stats["LEVEL_4"] ?? 0, color: "#42a5f5" },
      { level: "5", count: stats["LEVEL_5"] ?? 0, color: "#283593" },
    ];
  }, [levelStats]);

  const handleCreateReviewSession = async () => {
    if (!hasDue) return;
    const reviewSession = await reviewService.createReviewSession();
    navigate(`/review/${reviewSession?.id ?? ""}`, {
      state: {
        wordsDue,
        sessionId: reviewSession?.id,
      },
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 xs:p-0">
      {isNotebookEmpty ? (
        <RecommendationUI />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={dynamicData}
              margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
              barCategoryGap="1%"
            >
              <XAxis
                dataKey="level"
                axisLine={{ stroke: "#E5E7EB", strokeWidth: 4 }}
                tickLine={false}
                tick={{ fill: "#000", fontWeight: "bold", fontSize: 24 }}
                dy={15}
              />
              <YAxis hide={true} domain={[0, "dataMax + 20"]} />

              <Bar dataKey="count" barSize={60} radius={[15, 15, 0, 0]}>
                {dynamicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}

                <LabelList
                  dataKey="count"
                  position="top"
                  content={(props) => {
                    const { x, y, width, value } = props;
                    return (
                      <text
                        x={x + width / 2}
                        y={y - 10}
                        textAnchor="middle"
                        className="font-bold text-lg fill-black"
                      >
                        {value}{" "}
                        <tspan className="text-sm font-normal">từ</tspan>
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="text-center mt-8">
            {hasDue && (
              <p className="text-lg font-medium my-5">
                Số từ cần ôn tập:{" "}
                <span className="font-bold">{displayCount}</span> từ
              </p>
            )}

            {hasUpcoming && (
              <p className="text-lg font-medium my-5">
                Chuẩn bị ôn tập:{" "}
                <span className="font-bold">{displayCount}</span> từ
              </p>
            )}

            {!hasDue && !hasUpcoming && (
              <p className="text-lg font-medium mb-3 text-gray-500">
                Chưa có từ để ôn ở thời điểm hiện tại
              </p>
            )}

            <div className="flex justify-center items-center h-[70px]">
              {hasDue ? (
                <button
                  onClick={handleCreateReviewSession}
                  className="w-fit bg-(image:--my-gradient) text-white font-bold text-xl py-3 px-6 rounded-full 
                  hover:brightness-105
                  shadow-[0_4px_0_#1f8f2f] active:shadow-[0_0_0_#1f8f2f] active:translate-y-1
                  transition-all
                  duration-100
                  cursor-pointer
                  "
                >
                  ÔN TẬP NGAY
                </button>
              ) : hasUpcoming ? (
                <CountdownTimer targetDate={nextReviewAt} />
              ) : (
                <button
                  disabled
                  className="w-fit bg-gray-200 text-gray-400 font-bold text-xl py-3 px-6 rounded-full cursor-not-allowed"
                >
                  ÔN TẬP NGAY
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Review;
