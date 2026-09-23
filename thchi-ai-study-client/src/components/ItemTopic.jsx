import { useNavigate } from "react-router-dom";
import learnServices from "../services/learn.service";
import Swal from "sweetalert2";
import { Lock } from "lucide-react";

const ItemTopic = ({ topic, isCompleted, isLocked }) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    if (isLocked) {
      Swal.fire({
        text: "Nâng cấp tài khoản để mở khoá tất cả các khoá học",
        showCancelButton: true,
        confirmButtonText: "Nâng cấp ngay",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#22c55e",
        cancelButtonColor: "#d1d5db",
        customClass: {
          confirmButton: "rounded-full px-6 py-2",
          cancelButton: "rounded-full px-6 py-2",
          popup: "rounded-3xl",
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/premium");
        }
      });
      return;
    }

    const learningSession = await learnServices.createLearningSession(topic.id);
    navigate(`/learning/${topic.id}?sessionId=${learningSession.id}`, {
      state: {
        courseId: topic.courseId,
      },
    });
  };

  const containerClass = isCompleted 
    ? "bg-(image:--my-topic-green-gradient) hover:bg-(image:--my-topic-green-hover-gradient) shadow-topic-green text-white" 
    : "bg-[#f2f2f2] hover:bg-[#e5e5e5] shadow-sm text-gray-500";

  const titleClass = isCompleted ? "text-white" : "text-gray-700";
  const subtitleClass = isCompleted ? "text-white" : "text-gray-500";

  return (
    <div
      onClick={handleClick}
      className={`${containerClass} rounded-2xl p-3 mb-2 cursor-pointer transition-all duration-200 active:shadow-none active:translate-y-2`}
    >
      <div className="flex items-center gap-x-3 relative">
        <div className={`border-2 ${isCompleted ? 'border-yellow-400' : 'border-gray-300'} rounded-full p-[2px] relative`}>
          <img
            className={`w-16 h-16 sm:w-23 sm:h-23 rounded-full object-cover ${isLocked ? 'grayscale opacity-70' : ''}`}
            src={topic.imageUrl || "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2lybHxlbnwwfHwwfHx8MA%3D%3D"}
            alt="avatar"
          />
          {isLocked && (
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md flex items-center justify-center">
              <Lock size={12} className="text-gray-500" />
            </div>
          )}
        </div>
        <div>
          <h3 className={`${titleClass} font-bold text-lg sm:text-2xl`}>{topic.title}</h3>
          <span className={subtitleClass}>{topic.subtitle}</span>
        </div>
      </div>
    </div>
  );
};
export default ItemTopic;
