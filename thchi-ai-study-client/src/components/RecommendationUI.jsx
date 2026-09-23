import { useNavigate } from "react-router-dom";
import Button from "./Button";

const RecommendationUI = ({
  text = "Chưa có từ vựng nào trong sổ tay.\nHãy học 1 bài từ để cập nhật sổ tay",
  path = "/learn",
  imgUrl = "ThChi_ViewCourse.png",
  textButton = "Danh sách khóa học",
  showMoreButton = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div className="mb-4">
        <img
          src={imgUrl}
          alt="Xem danh sách khóa học"
          className="sm:w-80 sm:h-80 object-contain drop-shadow-sm"
        />
      </div>
      <div className="mb-8 w-full max-w-md px-4">
        <p className="font-semibold text-[18px] sm:text-xl text-gray-700 leading-relaxed whitespace-pre-line">
          {text}
        </p>
      </div>
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <Button
          style="bg-(image:--my-gradient) text-white font-bold py-1 rounded-xl hover:opacity-90 shadow-[0_5px_0_#1f8f2f] active:shadow-[0_0px_0_#1f8f2f] active:translate-y-[5px] transition-all"
          onClick={() => navigate(path)}
        >
          {textButton}
        </Button>
        {showMoreButton && (
          <Button
            onClick={() => navigate("/learn")}
            style="w-full bg-white text-gray-700 font-bold py-1 rounded-xl shadow-[0_5px_0_#e0e0e0] active:shadow-[0_0px_0_#e0e0e0] active:translate-y-[5px] border-2 border-gray-100 hover:bg-gray-50 transition-all"
          >
            Học từ mới
          </Button>
        )}
      </div>
    </div>
  );
};

export default RecommendationUI;
